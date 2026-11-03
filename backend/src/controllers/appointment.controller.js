import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper to convert time string (e.g. "09:00", "09:30 AM", "17:30", "5:30 PM") into minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const str = timeStr.trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[AP]M/, '').trim();
  const [hStr, mStr] = clean.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr || '0', 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, triageResult } = req.body;
    
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Doctor, consultation date, and time slot are required.' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Selected doctor was not found.' });
    }

    // 1. Validate Day of the Week against doctor's schedule
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    if (doctor.availability && doctor.availability.length > 0) {
      const daySlots = doctor.availability.filter(
        av => av.day?.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (!daySlots || daySlots.length === 0) {
        const availableDays = [...new Set(doctor.availability.map(av => av.day))].join(', ');
        return res.status(400).json({
          message: `Dr. ${doctor.name} does not accept consultations on ${dayOfWeek}s. Available days: ${availableDays || 'None'}.`
        });
      }

      // 2. Validate requested time falls within doctor's working hours
      const reqMinutes = parseTimeToMinutes(time);
      if (reqMinutes === null) {
        return res.status(400).json({ message: 'Invalid time format. Please choose a valid time slot.' });
      }

      const isInsideSlot = daySlots.some(slot => {
        const startMin = parseTimeToMinutes(slot.startTime);
        const endMin = parseTimeToMinutes(slot.endTime);
        return reqMinutes >= startMin && reqMinutes <= endMin;
      });

      if (!isInsideSlot) {
        const slotRanges = daySlots.map(s => `${s.startTime} - ${s.endTime}`).join(', ');
        return res.status(400).json({
          message: `Selected time (${time}) is outside Dr. ${doctor.name}'s working hours on ${dayOfWeek} (${slotRanges}). Please choose an available slot.`
        });
      }
    }

    // 3. Verify no existing conflict / already booked slot for this doctor
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: time.trim(),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: `The time slot (${time}) is already booked for Dr. ${doctor.name} on ${date}. Please choose another available slot.`
      });
    }

    // Create appointment instance
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: dateObj,
      time: time.trim(),
      reason,
      triageResult: triageResult || null
    });

    // Generate secure Telemedicine virtual clinic link
    appointment.telemedicineRoomUrl = `https://meet.jit.si/SmartHealthSphere-${appointment._id.toString().slice(-8)}`;
    await appointment.save();

    // 1. Notify Assigned Doctor
    await Notification.create({
      user: doctorId,
      title: 'New Patient Booking Request',
      message: `${req.user.name} has scheduled a consultation with you for ${date} at ${time}. Reason: "${reason || 'General Consult'}".`,
      type: 'appointment'
    });

    // 2. Notify Admins
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map(admin => ({
      user: admin._id,
      title: 'New Appointment Request',
      message: `${req.user.name} booked with doctor for ${date}. Risk level: ${triageResult?.triageLevel || 'Standard'}.`,
      type: 'appointment'
    }));
    
    if (adminNotifications.length > 0) {
      await Notification.insertMany(adminNotifications);
    }

    // 3. Notify Patient
    await Notification.create({
      user: req.user._id,
      title: 'Appointment Requested',
      message: `Your tele-consultation request for ${date} at ${time} is recorded. Telemedicine room link is ready.`,
      type: 'appointment'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorBookedSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.json([]);

    const [y, m, d] = date.split('-').map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedTimes = appointments.map(a => a.time);
    res.json(bookedTimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'doctor' ? { doctor: req.user._id } : { patient: req.user._id };
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: 1 });

    // Auto-generate reminders for today's appointments
    if (req.user.role === 'patient') {
      const today = new Date().toDateString();
      for (const apt of appointments) {
        if (apt.status === 'confirmed' && apt.doctor && new Date(apt.date).toDateString() === today) {
          const doctorName = apt.doctor.name || 'Doctor';
          // Check if reminder already sent today
          const existing = await Notification.findOne({
            user: req.user._id,
            type: 'reminder',
            message: { $regex: doctorName }
          });
          if (!existing) {
            await Notification.create({
              user: req.user._id,
              title: 'Appointment Reminder',
              message: `Reminder: You have an appointment today with Dr. ${doctorName} at ${apt.time}.`,
              type: 'reminder'
            });
          }
        }
      }
    }

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id).populate('doctor', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const patientId = appointment.patient ? appointment.patient.toString() : null;
    const doctorId = appointment.doctor ? (appointment.doctor._id ? appointment.doctor._id.toString() : appointment.doctor.toString()) : null;
    const userId = req.user._id.toString();

    // Verify ownership or admin role
    const isPatient = patientId === userId;
    const isDoctor = doctorId === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isPatient && !isDoctor) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Bug 29 Fix: Patients can ONLY cancel their appointments; they cannot approve or complete them
    if (isPatient && !isAdmin && !isDoctor && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel their appointments.' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    // Trigger Notification to Patient if updated by Doctor or Admin
    const doctorName = appointment.doctor?.name || 'Doctor';
    let notificationMsg = '';
    if (status === 'confirmed') notificationMsg = `Your appointment with Dr. ${doctorName} has been confirmed!`;
    if (status === 'cancelled') notificationMsg = `Your appointment with Dr. ${doctorName} was cancelled.`;
    
    if (notificationMsg && appointment.patient) {
      await Notification.create({
        user: appointment.patient,
        title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: notificationMsg,
        type: 'appointment'
      });
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

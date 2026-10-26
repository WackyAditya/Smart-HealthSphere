import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, triageResult } = req.body;
    
    // Create appointment instance
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
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

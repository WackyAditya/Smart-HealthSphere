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
        if (apt.status === 'confirmed' && new Date(apt.date).toDateString() === today) {
          // Check if reminder already sent today (simple heuristic: find recent notification)
          const existing = await Notification.findOne({
            user: req.user._id,
            type: 'reminder',
            message: { $regex: apt.doctor.name }
          });
          if (!existing) {
            await Notification.create({
              user: req.user._id,
              title: 'Appointment Reminder',
              message: `Reminder: You have an appointment today with ${apt.doctor.name} at ${apt.time}.`,
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
    const appointment = await Appointment.findById(req.params.id).populate('doctor', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify ownership or admin role
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    // Trigger Notification to Patient
    let notificationMsg = '';
    if (status === 'confirmed') notificationMsg = `Your appointment with ${appointment.doctor.name} has been confirmed!`;
    if (status === 'cancelled') notificationMsg = `Your appointment with ${appointment.doctor.name} was cancelled.`;
    
    if (notificationMsg) {
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

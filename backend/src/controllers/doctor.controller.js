import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export const listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isApproved: true })
      .select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');
      
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ date: 1 });
      
    const totalPatients = [...new Set(appointments.map(a => a.patient._id.toString()))].length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    
    res.json({
      totalPatients,
      pendingAppointments,
      completedAppointments,
      recentAppointments: appointments.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const doctor = await User.findById(req.user._id);
    
    if (doctor) {
      doctor.availability = availability;
      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor.availability);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listPatientsForDoctor = async (req, res) => {
  try {
    // Find all patients in the system
    const patients = await User.find({ role: 'patient' })
      .select('name email _id phone createdAt')
      .sort({ name: 1 });

    // Also get appointments to see which patients have consultations with this doctor
    const doctorAppointments = await Appointment.find({ doctor: req.user._id }).select('patient');
    const consultedPatientIds = new Set(doctorAppointments.map(a => a.patient.toString()));

    const formatted = patients.map(p => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      hasAppointment: consultedPatientIds.has(p._id.toString())
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


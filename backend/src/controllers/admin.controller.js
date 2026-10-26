import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const totalRecords = await MedicalRecord.countDocuments();
    
    // Bug 27 Fix: Calculate revenue based on actual doctor consultation fees
    const completedAppointments = await Appointment.find({ status: 'completed' }).populate('doctor', 'consultationFee');
    const mockRevenue = completedAppointments.reduce((acc, apt) => acc + (apt.doctor?.consultationFee || 100), 0);

    res.json({
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRecords,
      mockRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const manageUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Bug 34 Fix: Update actual isActive field in database
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    } else if (status === 'active') {
      user.isActive = true;
    } else if (status === 'inactive' || status === 'deactivated') {
      user.isActive = false;
    }

    await user.save();
    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.isApproved = true;
    await doctor.save();
    
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const viewAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, experience, consultationFee } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      specialization,
      experience,
      consultationFee,
      isApproved: true // Admin added doctors are pre-approved
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const doctor = await User.findById(req.params.id);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.availability = availability;
    await doctor.save();
    
    res.json({ message: 'Availability updated successfully', availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


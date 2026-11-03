import express from 'express';
import { bookAppointment, getMyAppointments, updateAppointmentStatus, getDoctorBookedSlots } from '../controllers/appointment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/doctor/:doctorId/booked-slots', protect, getDoctorBookedSlots);
router.post('/', protect, bookAppointment);
router.get('/me', protect, getMyAppointments);
router.get('/my-appointments', protect, getMyAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);

export default router;


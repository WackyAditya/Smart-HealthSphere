import express from 'express';
import { 
  listDoctors, 
  getDoctorProfile, 
  getDoctorDashboard, 
  updateAvailability,
  listPatientsForDoctor
} from '../controllers/doctor.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', listDoctors);
router.get('/dashboard/me', protect, authorize('doctor'), getDoctorDashboard);
router.get('/patients/all', protect, authorize('doctor'), listPatientsForDoctor);
router.patch('/availability/me', protect, authorize('doctor'), updateAvailability);
router.get('/:id', getDoctorProfile);

export default router;

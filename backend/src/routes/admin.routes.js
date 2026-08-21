import express from 'express';
import { 
  getAnalytics, 
  manageUsers, 
  updateUserStatus, 
  approveDoctor, 
  viewAllAppointments,
  addDoctor,
  updateDoctorAvailability,
  deleteUser
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', manageUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/doctors/:id/approval', approveDoctor);
router.post('/doctors', addDoctor);
router.patch('/doctors/:id/availability', updateDoctorAvailability);
router.get('/appointments', viewAllAppointments);

export default router;

import express from 'express';
import { uploadRecord, viewRecords, deleteRecord } from '../controllers/medicalRecord.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, authorize('patient', 'doctor', 'admin'), uploadRecord);
router.get('/', protect, authorize('patient', 'doctor', 'admin'), viewRecords);
router.get('/me', protect, authorize('patient', 'doctor', 'admin'), viewRecords);
router.delete('/:id', protect, authorize('patient', 'doctor', 'admin'), deleteRecord);

export default router;

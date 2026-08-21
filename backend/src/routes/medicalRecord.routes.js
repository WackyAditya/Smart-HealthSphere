import express from 'express';
import { uploadRecord, viewRecords, deleteRecord } from '../controllers/medicalRecord.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, authorize('patient', 'doctor'), uploadRecord);
router.get('/me', protect, authorize('patient', 'doctor'), viewRecords);
router.delete('/:id', protect, authorize('patient', 'admin'), deleteRecord);

export default router;

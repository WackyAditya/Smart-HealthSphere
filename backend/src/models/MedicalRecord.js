import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  encryptedDescription: { type: String },
  iv: { type: String },
  isEncrypted: { type: Boolean, default: true },
  fileUrl: { type: String },
  recordType: { type: String, enum: ['Prescription', 'Lab Result', 'Clinical Note', 'Vitals Chart', 'General'], default: 'Clinical Note' },
  vitals: {
    bloodPressure: { type: String },
    heartRate: { type: String },
    temperature: { type: String },
    spo2: { type: String }
  }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;


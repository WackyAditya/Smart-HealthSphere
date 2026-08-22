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
  recordType: { 
    type: String, 
    enum: ['Prescription', 'Lab Result', 'Clinical Note', 'Clinical Evaluation', 'Prescription & Clinical Note', 'Vitals Chart', 'General'], 
    default: 'Clinical Note' 
  },
  vitals: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;


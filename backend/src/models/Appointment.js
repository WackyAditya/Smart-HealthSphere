import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  reason: { type: String },
  telemedicineRoomUrl: { type: String },
  triageResult: {
    triageLevel: { type: String },
    riskScore: { type: Number },
    recommendedSpecialty: { type: String },
    symptomsEvaluated: { type: String },
    isEmergency: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;


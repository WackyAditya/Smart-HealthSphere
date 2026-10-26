import MedicalRecord from '../models/MedicalRecord.js';
import { encryptText, decryptText } from '../utils/encryption.util.js';

export const uploadRecord = async (req, res) => {
  try {
    const { patientId, title, description, fileUrl, recordType, vitals } = req.body;
    
    // Determine patient and doctor based on who is uploading
    let patient = patientId;
    let doctor = req.user._id;

    if (req.user.role === 'patient') {
      patient = req.user._id;
      doctor = req.body.doctorId || req.user._id;
    }

    const { encryptedData, iv } = encryptText(description || 'Clinical evaluation record');

    let validRecordType = recordType || 'Clinical Note';
    if (!['Prescription', 'Lab Result', 'Clinical Note', 'Clinical Evaluation', 'Prescription & Clinical Note', 'Vitals Chart', 'General'].includes(validRecordType)) {
      validRecordType = 'Clinical Note';
    }

    // Bug 31 Fix: Do NOT store unencrypted plaintext in MongoDB
    const record = await MedicalRecord.create({
      patient,
      doctor: doctor || req.user._id,
      title,
      description: '[Encrypted Clinical Note]', // Plaintext never stored in DB
      encryptedDescription: encryptedData,
      iv: iv,
      isEncrypted: true,
      fileUrl: fileUrl || '#',
      recordType: validRecordType,
      vitals: vitals || {}
    });

    const populatedRecord = await record.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    const resultObj = populatedRecord.toObject();
    resultObj.decryptedDescription = description || 'Clinical evaluation record';

    res.status(201).json(resultObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const viewRecords = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query = { patient: req.user._id };
    } else if (req.user.role === 'doctor') {
      // Bug 19 Fix: Allow doctors to see records they authored OR records of patients who consulted with them
      const Appointment = (await import('../models/Appointment.js')).default;
      const doctorAppointments = await Appointment.find({ doctor: req.user._id }).select('patient');
      const patientIds = doctorAppointments.map(a => a.patient).filter(Boolean);
      query = {
        $or: [
          { doctor: req.user._id },
          { patient: { $in: patientIds } }
        ]
      };
    }
    // Admin sees all records

    const rawRecords = await MedicalRecord.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });
    
    const records = rawRecords.map(rec => {
      const doc = rec.toObject();
      if (doc.encryptedDescription && doc.iv) {
        doc.decryptedDescription = decryptText(doc.encryptedDescription, doc.iv);
      } else {
        doc.decryptedDescription = doc.description;
      }
      return doc;
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const patientId = record.patient ? record.patient.toString() : null;
    const doctorId = record.doctor ? record.doctor.toString() : null;
    const userId = req.user._id.toString();

    // Admin, patient owner, or creating doctor can delete
    if (req.user.role !== 'admin' && patientId !== userId && doctorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await record.deleteOne();
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

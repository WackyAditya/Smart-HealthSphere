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

    const record = await MedicalRecord.create({
      patient,
      doctor,
      title,
      description: description || 'Clinical evaluation record',
      encryptedDescription: encryptedData,
      iv: iv,
      isEncrypted: true,
      fileUrl: fileUrl || '#',
      recordType: validRecordType,
      vitals: vitals || {}
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const viewRecords = async (req, res) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patient: req.user._id } 
      : { doctor: req.user._id };

    const rawRecords = await MedicalRecord.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
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

    // Only Admin or the Patient who owns it can delete
    if (req.user.role !== 'admin' && record.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await record.deleteOne();
    res.json({ message: 'Record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

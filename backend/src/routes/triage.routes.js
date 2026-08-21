import express from 'express';
import { analyzeSymptoms } from '../services/triage.service.js';

const router = express.Router();

/**
 * POST /api/triage/analyze
 * Evaluates patient symptoms and returns AI triage report
 */
router.post('/analyze', async (req, res) => {
  try {
    const { symptoms, durationDays, severityRating, age, existingConditions } = req.body;
    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ message: 'Symptoms description is required for AI triage evaluation.' });
    }

    const triageResult = await analyzeSymptoms({
      symptoms,
      durationDays: Number(durationDays) || 1,
      severityRating: Number(severityRating) || 5,
      age: age ? Number(age) : undefined,
      existingConditions: Array.isArray(existingConditions) ? existingConditions : []
    });

    return res.status(200).json({
      success: true,
      data: triageResult
    });
  } catch (error) {
    console.error('Triage analysis error:', error);
    return res.status(500).json({ message: 'Failed to analyze symptoms.', error: error.message });
  }
});

export default router;

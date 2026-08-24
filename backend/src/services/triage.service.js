/**
 * AI-Assisted Clinical Triage Engine for Smart HealthSphere
 */

const SYMPTOM_SPECIALTY_MAP = [
  {
    keywords: ['chest pain', 'heart', 'shortness of breath', 'palpitations', 'cardiac', 'bp', 'blood pressure', 'angina'],
    specialty: 'Cardiology',
    baseSeverity: 85,
    triageLevel: 'High Risk',
    emergencyKeywords: ['severe chest pain', 'crushing chest pain', 'arm pain', 'fainting', 'loss of consciousness']
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'paralysis', 'memory loss', 'brain', 'tremor','tumor'],
    specialty: 'Neurology',
    baseSeverity: 75,
    triageLevel: 'High Risk',
    emergencyKeywords: ['sudden numbness', 'slurred speech', 'facial drooping', 'unresponsive']
  },
  {
    keywords: ['rash','rashes', 'skin', 'itching', 'eczema', 'acne', 'lesion', 'mole', 'psoriasis', 'hives', 'dermatitis'],
    specialty: 'Dermatology',
    baseSeverity: 35,
    triageLevel: 'Low Risk',
    emergencyKeywords: ['sudden severe allergic reaction', 'anaphylaxis', 'skin peeling']
  },
  {
    keywords: ['joint pain', 'bone', 'fracture', 'knee', 'back pain', 'spine', 'arthritis', 'ligament', 'sprain'],
    specialty: 'Orthopedics',
    baseSeverity: 55,
    triageLevel: 'Moderate',
    emergencyKeywords: ['open fracture', 'unable to walk', 'severe spinal pain']
  },
  {
    keywords: ['child', 'pediatric', 'infant', 'baby', 'toddler', 'growth'],
    specialty: 'Pediatrics',
    baseSeverity: 50,
    triageLevel: 'Moderate',
    emergencyKeywords: ['high fever in infant', 'difficulty breathing in child']
  },
  {
    keywords: ['stomach', 'nausea', 'vomiting', 'diarrhea', 'acid reflux', 'gastro', 'abdominal pain', 'cramps'],
    specialty: 'Gastroenterology',
    baseSeverity: 50,
    triageLevel: 'Moderate',
    emergencyKeywords: ['severe abdominal pain', 'vomiting blood', 'black stool']
  },
  {
    keywords: ['fever', 'cough', 'cold', 'fatigue', 'flu', 'sore throat', 'body ache', 'weakness'],
    specialty: 'General Medicine',
    baseSeverity: 40,
    triageLevel: 'Low Risk',
    emergencyKeywords: ['fever above 104', 'unable to breathe', 'bluish lips']
  }
];

export const analyzeSymptoms = async ({ symptoms, durationDays = 1, severityRating = 5, age, existingConditions = [] }) => {
  const query = (symptoms || '').toLowerCase();
  let matchedSpecialties = [];
  let highestBaseSeverity = 30;
  let isEmergency = false;
  let riskFactors = [];
  let emergencyReason = '';

  // Analyze keywords
  for (const group of SYMPTOM_SPECIALTY_MAP) {
    // Check emergency triggers first
    for (const emKey of group.emergencyKeywords) {
      if (query.includes(emKey)) {
        isEmergency = true;
        emergencyReason = `Critical symptom detected: "${emKey}". Immediate medical attention recommended.`;
        highestBaseSeverity = Math.max(highestBaseSeverity, 95);
        matchedSpecialties.push(group.specialty);
        riskFactors.push(`Red flag symptom: ${emKey}`);
        break;
      }
    }

    // Check general keywords
    for (const key of group.keywords) {
      if (query.includes(key)) {
        if (!matchedSpecialties.includes(group.specialty)) {
          matchedSpecialties.push(group.specialty);
        }
        highestBaseSeverity = Math.max(highestBaseSeverity, group.baseSeverity);
      }
    }
  }

  // Fallback to General Medicine if no specific keywords matched
  if (matchedSpecialties.length === 0) {
    matchedSpecialties.push('General Medicine');
  }

  // Calculate calculated risk score (0-100)
  let calculatedScore = highestBaseSeverity + (Number(severityRating) * 2);
  if (durationDays > 7) {
    calculatedScore += 10;
    riskFactors.push('Persistent symptoms exceeding 7 days');
  }
  if (age && (age > 65 || age < 5)) {
    calculatedScore += 10;
    riskFactors.push('High-risk age bracket');
  }
  if (existingConditions && existingConditions.length > 0) {
    calculatedScore += 10;
    riskFactors.push(`Pre-existing medical conditions noted: ${existingConditions.join(', ')}`);
  }

  calculatedScore = Math.min(100, Math.max(10, Math.round(calculatedScore)));

  // Determine Triage Level
  let triageLevel = 'Low Risk';
  if (isEmergency || calculatedScore >= 85) {
    triageLevel = 'Emergency';
  } else if (calculatedScore >= 65) {
    triageLevel = 'High Risk';
  } else if (calculatedScore >= 45) {
    triageLevel = 'Moderate';
  }

  // Recommendations
  let clinicalAdvice = [];
  if (triageLevel === 'Emergency') {
    clinicalAdvice.push('🚨 Please seek immediate emergency medical care or call local emergency services (e.g. 911 / 112).');
    clinicalAdvice.push('Immediate tele-consultation or ER visit recommended.');
  } else if (triageLevel === 'High Risk') {
    clinicalAdvice.push('⚠️ We recommend booking a consultation within 24 hours with a specialist.');
    clinicalAdvice.push('Keep track of vital signs (temperature, blood pressure, pulse).');
  } else if (triageLevel === 'Moderate') {
    clinicalAdvice.push('📋 Schedule a virtual telemedicine consultation within 2-3 days.');
    clinicalAdvice.push('Ensure adequate rest, hydration, and symptom monitoring.');
  } else {
    clinicalAdvice.push('✅ Symptoms appear mild. Schedule a routine tele-consultation at your convenience.');
    clinicalAdvice.push('Maintain hydration and rest. Re-evaluate if symptoms worsen.');
  }

  return {
    symptomsEvaluated: symptoms,
    triageLevel,
    riskScore: calculatedScore,
    isEmergency,
    emergencyReason: isEmergency ? emergencyReason : null,
    recommendedSpecialty: matchedSpecialties[0],
    alternativeSpecialties: matchedSpecialties.slice(1),
    riskFactors,
    clinicalAdvice,
    timestamp: new Date().toISOString()
  };
};

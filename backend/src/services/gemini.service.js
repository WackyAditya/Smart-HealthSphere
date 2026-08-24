import { GoogleGenAI } from '@google/genai';
import User from '../models/User.js';

export const generateHealthChatResponse = async (message, history = [], userInfo = null) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Retrieve current active doctors and specialties from MongoDB for live context
  let doctorsContext = 'Currently registered doctors in Smart HealthSphere:\n';
  try {
    const doctors = await User.find({ role: 'doctor', isApproved: true })
      .select('name specialization experience consultationFee availability')
      .lean();
    if (doctors && doctors.length > 0) {
      doctorsContext += doctors.map(d => 
        `- Dr. ${d.name} (${d.specialization || 'General Medicine'}, ${d.experience || 5}+ yrs experience, Fee: $${d.consultationFee || 100})`
      ).join('\n');
    } else {
      doctorsContext += 'Specialists available across Cardiology, Pediatrics, Dermatology, Neurology, Orthopedics, General Medicine, and Psychiatry.';
    }
  } catch (err) {
    doctorsContext += 'Specialists available across Cardiology, Pediatrics, Dermatology, Neurology, Orthopedics, General Medicine, and Psychiatry.';
  }

  const systemInstruction = `
You are "HealthSphere AI Concierge", a 24/7 empathetic, intelligent, and highly capable healthcare assistant for the "Smart HealthSphere" platform.

Key Capabilities & System Context:
1. Directory & Booking: Help patients understand how to find doctors, schedule appointments, and join telemedicine video consultations via WebRTC virtual rooms.
2. Encrypted Health Records: Explain how AES-256 field-level encrypted EHR protects patient clinical notes, vitals, and prescriptions.
3. Doctor Availability: Here is live database information about specialists:
${doctorsContext}
4. Patient Context: ${userInfo ? `The user is logged in as ${userInfo.name} (${userInfo.role || 'patient'}).` : 'The user is a visitor/guest.'}
5. Safety Guidelines & Guardrails:
   - Provide helpful health education, triage guidance, wellness tips, and app navigation.
   - NEVER provide a definitive medical diagnosis or prescribe exact medication dosages.
   - ALWAYS advise consulting a licensed physician for specific medical conditions.
   - If the user describes life-threatening emergency symptoms (severe chest pain, breathing difficulty, stroke symptoms, uncontrolled bleeding), immediately urge them to call emergency services (e.g. 911 / 112) or visit the nearest emergency room.
6. Tone: Warm, professional, reassuring, clear, and well-structured using markdown formatting (bullet points, bold text).
`;

  if (!apiKey || apiKey.trim() === '') {
    // Intelligent local fallback if API key is not yet configured in .env
    return {
      reply: `👋 Hello! I am your **Smart HealthSphere 24/7 Health Concierge**.\n\n` +
        `To activate live **Gemini AI** reasoning, please add your Google AI Studio API key to \`backend/.env\` as \`GEMINI_API_KEY=your_key_here\`.\n\n` +
        `In the meantime, here is what I can help you with:\n` +
        `• **Find a Doctor:** Browse our verified specialists in Cardiology, Pediatrics, Neurology, and more in the [Specialists Directory](/doctors).\n` +
        `• **AI Symptom Triage:** Launch symptom triage on the homepage for urgency assessment.\n` +
        `• **Telemedicine Video Rooms:** Join instant 1-click consultation rooms.\n` +
        `• **AES-256 Vault:** Access your encrypted medical notes and prescriptions in your dashboard.`,
      isFallback: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for GenAI SDK
    const contents = [];

    // Add prior conversation turns if any
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Use latest high-speed Gemini 3.6 Flash
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let response = null;
    let lastErr = null;

    for (const mod of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: mod,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 800,
          },
          contents: contents,
        });
        if (response && response.text) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!response || !response.text) {
      throw lastErr || new Error('No response from Gemini models');
    }

    const replyText = response.text || "I am here to help you navigate Smart HealthSphere. How can I assist your health journey today?";
    return {
      reply: replyText,
      isFallback: false
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      reply: `I encountered a temporary issue with Gemini AI: ${error.message || 'Please check API key'}.\n\nYou can still browse our [Specialists Directory](/doctors) or book an appointment directly!`,
      isFallback: true,
      error: error.message
    };
  }
};

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
You are "HealthSphere AI Concierge", a focused medical & healthcare assistant for the Smart HealthSphere platform.

STRICT RULES & CONSTRAINTS:
1. STRICT TOPIC SCOPE: 
   - You ONLY answer questions about medical health education, symptoms, triage, wellness, or the Smart HealthSphere platform (finding doctors, booking appointments, WebRTC video telemedicine, AES-256 encrypted records).
   - If the user asks about ANYTHING ELSE (e.g. coding, homework, math, politics, movies, general trivia, gaming), immediately decline in one single sentence: "I am a dedicated healthcare assistant for Smart HealthSphere and can only assist with medical questions and platform features."

2. SHORT & CRISP RESPONSES:
   - Keep answers very brief, direct, and under 3-4 bullet points or 2-3 sentences maximum.
   - Do NOT use filler greetings, long introductions, or repetitive disclaimers. Get straight to the point.

3. LIVE PLATFORM DATA:
${doctorsContext}
- Patient: ${userInfo ? `${userInfo.name} (${userInfo.role || 'patient'})` : 'Guest'}

4. MEDICAL SAFETY:
   - For emergencies (chest pain, stroke symptoms, severe breathing issues), give a 1-sentence urgent directive to call 911/112 or visit an emergency room.
   - Suggest seeing a doctor for prescriptions/diagnosis.
`;

  if (!apiKey || apiKey.trim() === '') {
    // Intelligent local fallback if API key is not yet configured in .env
    return {
      reply: `👋 **Smart HealthSphere Concierge**\n\n• **Find a Doctor:** Browse specialists in our [Directory](/doctors).\n• **AI Triage:** Launch symptom triage on the homepage.\n• **Telemedicine:** Join 1-click video consultations.\n• **EHR Vault:** View your AES-256 encrypted medical records.`,
      isFallback: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for GenAI SDK
    const contents = [];

    // Add prior conversation turns if any
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
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
            temperature: 0.2,
            maxOutputTokens: 500,
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

import { generateHealthChatResponse } from '../services/gemini.service.js';

export const handleAIChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const userInfo = req.user ? { name: req.user.name, role: req.user.role } : null;

    const aiResult = await generateHealthChatResponse(message, history || [], userInfo);

    res.json(aiResult);
  } catch (error) {
    console.error('Error handling AI chat:', error);
    res.status(500).json({ 
      message: 'Failed to process AI chat message',
      error: error.message 
    });
  }
};

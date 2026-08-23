import express from 'express';
import { handleAIChatMessage } from '../controllers/aiChat.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/message', optionalAuth, handleAIChatMessage);

export default router;

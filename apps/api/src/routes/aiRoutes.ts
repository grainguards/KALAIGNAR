import { Router } from 'express';
import { analyzeImage, parseVoiceIntent, chatWithAssistant, removeBackground, voiceNegotiate } from '../controllers/aiController';

const router = Router();

router.post('/analyze', analyzeImage);
router.post('/intent', parseVoiceIntent);
router.post('/chat', chatWithAssistant);
router.post('/remove-background', removeBackground);
router.post('/voice-negotiate', voiceNegotiate);

export default router;



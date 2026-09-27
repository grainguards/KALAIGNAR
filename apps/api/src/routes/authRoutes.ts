import { Router } from 'express';
import { requestOtp, verifyOtp, getProfile, updatePreferences } from '../controllers/authController';

const router = Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile/:id', getProfile);
router.post('/preferences', updatePreferences);
router.put('/profile/:id/preferences', updatePreferences);

export default router;

import { Router } from 'express';
import { estimatePricing } from '../controllers/productStudioController';

const router = Router();

router.post('/estimate', estimatePricing);

export default router;

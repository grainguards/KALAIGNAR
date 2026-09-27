import { Router } from 'express';
import { generateCatalog } from '../controllers/productStudioController';

const router = Router();

router.post('/generate', generateCatalog);
router.post('/translate', generateCatalog);

export default router;

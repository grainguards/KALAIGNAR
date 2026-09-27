import { Router } from 'express';
import {
  segmentAndRemoveBg,
  enhanceProduct,
  analyzeExtractedProduct,
  generateCatalog,
  estimatePricing,
  runCompletePipeline,
  getProductById,
} from '../controllers/productStudioController';

const router = Router();

// Section 14 Endpoint Specifications
router.post('/segment', segmentAndRemoveBg);
router.post('/remove-background', segmentAndRemoveBg);
router.post('/enhance', enhanceProduct);
router.post('/analyze', analyzeExtractedProduct);
router.post('/pipeline', runCompletePipeline);
router.get('/:id', getProductById);

export default router;

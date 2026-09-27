import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import productStudioRoutes from './routes/productStudioRoutes';
import catalogRoutes from './routes/catalogRoutes';
import pricingRoutes from './routes/pricingRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '20mb' })); // Large limit for base64 images
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productStudioRoutes);
app.use('/api/products', productRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Karigar AI Backend listening at http://localhost:${port}`);
});

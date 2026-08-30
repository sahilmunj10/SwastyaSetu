import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Swasthya Setu Public Healthcare API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'SIH Prototype 2026 - Government of Maharashtra'
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 SWASTHYA SETU API Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🌐 Base API: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

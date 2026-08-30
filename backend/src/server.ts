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

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred in healthcare gateway.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 SWASTHYA SETU API Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`🌐 Base API: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

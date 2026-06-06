import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import animaisRouter from './routes/animais.js';
import vacinacoesRouter from './routes/vacinacoes.js';
import pesagensRouter from './routes/pesagens.js';
import syncRouter from './routes/sync.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Routes
app.use('/api/animais', animaisRouter);
app.use('/api/vacinacoes', vacinacoesRouter);
app.use('/api/pesagens', pesagensRouter);
app.use('/api/sync', syncRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

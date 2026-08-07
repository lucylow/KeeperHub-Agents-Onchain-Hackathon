import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import statusRoutes from './routes/status';
import historyRoutes from './routes/history';
import configRoutes from './routes/config';
import executeRoutes from './routes/execute';
import walletRoutes from './routes/wallet';
import auditRoutes from './routes/audit-trail';
import onboardingRoutes from './routes/onboarding';
import { validateConfigUpdate } from './middleware/validate';
import { keeperHub } from './services/keeperhub';
import logger from './utils/logger';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/status', statusRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/config', configRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/audit-trail', auditRoutes);
app.use('/api/onboarding', onboardingRoutes);

/**
 * Webhook endpoint with authentication validation
 * Friction Point 4 Fix
 */
app.post('/api/webhook', (req, res) => {
  if (!keeperHub.validateWebhookAuth(req.headers)) {
    logger.warn('Unauthorized webhook attempt');
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authentication header. Use "Authorization: kh_..." or "x-api-key: kh_..."' 
    });
  }
  
  logger.info('Webhook received', { body: req.body });
  res.json({ received: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler with actionable advice
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    advice: 'If you are seeing network errors, check your CHAIN_ID and NETWORK environment variables.'
  });
});

export default app;

import { Router } from 'express';
import { dcaEngine } from '../services/dca-engine';
import logger from '../utils/logger';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = await dcaEngine.checkFunding();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset', (req, res) => {
  logger.info('Resetting onboarding status');
  dcaEngine.resetOnboarding();
  res.json({ success: true, message: 'Onboarding reset successfully' });
});

export default router;

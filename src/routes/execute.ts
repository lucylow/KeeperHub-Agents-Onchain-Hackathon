import { Router } from 'express';
import { dcaEngine } from '../services/dca-engine';
import logger from '../utils/logger';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const execution = await dcaEngine.triggerManualExecution();
    res.json({
      success: true,
      execution
    });
  } catch (error: any) {
    logger.error('Manual execution failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

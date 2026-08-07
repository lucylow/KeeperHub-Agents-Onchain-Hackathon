import { Router } from 'express';
import { dcaEngine } from '../services/dca-engine';

const router = Router();

router.get('/', (req, res) => {
  const config = dcaEngine.getConfig();
  res.json({
    status: config.paused ? 'paused' : 'active',
    lastRun: dcaEngine.getHistory()[0]?.timestamp || null,
    nextRun: new Date(Date.now() + 3600000).toISOString(), // Mock next run in 1 hour
    agentId: 'KGB-001',
    version: '1.0.0'
  });
});

export default router;

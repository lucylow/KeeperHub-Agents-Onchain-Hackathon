import { Router } from 'express';
import { dcaEngine } from '../services/dca-engine';
import { validateConfigUpdate } from '../middleware/validate';

const router = Router();

router.get('/', (req, res) => {
  res.json(dcaEngine.getConfig());
});

router.put('/', validateConfigUpdate, (req, res) => {
  const newConfig = dcaEngine.updateConfig(req.body);
  res.json(newConfig);
});

export default router;

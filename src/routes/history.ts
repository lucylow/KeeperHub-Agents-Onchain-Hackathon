import { Router } from 'express';
import { dcaEngine } from '../services/dca-engine';

const router = Router();

router.get('/', (req, res) => {
  res.json(dcaEngine.getHistory());
});

export default router;

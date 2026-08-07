import { Router } from 'express';
import { keeperHub } from '../services/keeperhub';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const balance = await keeperHub.getWalletBalance();
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

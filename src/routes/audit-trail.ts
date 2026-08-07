import { Router } from 'express';
import { auditService } from '../services/audit.service';

const router = Router();

router.get('/', (req, res) => {
  res.json(auditService.getRecords());
});

export default router;

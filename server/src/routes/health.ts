import { Router } from 'express';
import { pingDb } from '../db/connection.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbOk = await pingDb();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbOk ? 'connected' : 'unreachable',
  });
});

export default router;

import { Router } from 'express';
import { track, captureLead } from '../controllers/analytics.controller';

const router = Router();

router.post('/track', track);
router.post('/lead', captureLead);

export default router;

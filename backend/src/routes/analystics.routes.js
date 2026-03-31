import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';

const router = Router();
router.get('/', ctrl.getAnalytics);

export default router;
import { Router } from 'express';
import * as ctrl from '../controllers/error.controller.js';

const router = Router();
router.get('/', ctrl.listErrors);
router.get('/analytics', ctrl.errorAnalytics);

export default router;
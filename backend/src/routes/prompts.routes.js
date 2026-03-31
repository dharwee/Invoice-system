import { Router } from 'express';
import * as ctrl from '../controllers/prompts.controller.js';

const router = Router();
router.post('/', ctrl.createPrompt);
router.get('/', ctrl.listPrompts);
router.get('/dropdown', ctrl.getPromptsDropdown);
router.patch('/:id/activate', ctrl.activatePrompt);

export default router;
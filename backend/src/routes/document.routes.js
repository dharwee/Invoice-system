import { Router } from 'express';
import upload from '../middleware/upload.middleware.js';
import * as ctrl from '../controllers/document.controller.js';

const router = Router();
router.post('/', upload.array('files[]'), ctrl.uploadDocuments);
router.get('/', ctrl.listDocuments);
router.get('/:id', ctrl.getDocument);
router.patch('/:id', ctrl.patchDocument);
router.post('/reprocess/:id', ctrl.reprocessDocumentEndpoint);

export default router;
import express from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  archiveDocument,
  restoreDocument,
  getDocumentStats,
  upload
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Document routes
router.get('/', getDocuments);
router.get('/stats', getDocumentStats);
router.get('/:id', getDocumentById);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id/download', downloadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.put('/:id/archive', archiveDocument);
router.put('/:id/restore', restoreDocument);

export default router;
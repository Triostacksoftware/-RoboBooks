import express from 'express';
import {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntryFromAdjustment,
  createManualJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
  deleteJournalEntry
} from '../controllers/journalEntryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Journal entry routes
router.get('/', getJournalEntries);
router.get('/:id', getJournalEntryById);
router.post('/from-adjustment/:adjustmentId', createJournalEntryFromAdjustment);
router.post('/manual', createManualJournalEntry);
router.put('/:id/post', postJournalEntry);
router.put('/:id/reverse', reverseJournalEntry);
router.delete('/:id', deleteJournalEntry);

export default router;

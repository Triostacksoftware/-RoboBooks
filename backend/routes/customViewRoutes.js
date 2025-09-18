import express from 'express';

const router = express.Router();

// Placeholder routes for custom views
router.get('/', (req, res) => {
  res.json({ message: 'Custom view routes' });
});

export default router;

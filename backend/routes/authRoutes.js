// backend/routes/authRoutes.js
import { Router } from 'express';
import { handleRefreshToken, logout } from '../controllers/authController.js';
import { signup, login } from '../controllers/authController.js'; // existing

const router = Router();

router.post('/signup', signup);
router.post('/login',  login);
router.post('/logout', logout);
router.post('/refresh-token', handleRefreshToken);

export default router;

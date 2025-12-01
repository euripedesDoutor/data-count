import express from 'express';
import { register, login, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

export default router;

import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { loginSchema } from '../validators/auth.validators.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', protect, me);

export default router;

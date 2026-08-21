import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireStoreStaff } from '../middlewares/roles';
import { validate } from '../middlewares/validate';
import { validateGenerateAiReminder } from '../validators/schemas';

const router = Router();

// Generate personalized reminder message via Gemini AI
router.post(
  '/generate-reminder',
  authMiddleware,
  requireStoreStaff,
  validate(validateGenerateAiReminder),
  (req, res, next) => aiController.generateReminder(req, res, next)
);

// Get AI credit health insights
router.get('/insights', authMiddleware, requireStoreStaff, (req, res, next) =>
  aiController.getInsights(req, res, next)
);

export default router;

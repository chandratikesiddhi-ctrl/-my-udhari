import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';
import { requireOwner } from '../middlewares/roles';
import { validate } from '../middlewares/validate';
import { validateUpdateStore } from '../validators/schemas';

const router = Router();

// Get store profile (public / customer passbook readable)
router.get('/profile', optionalAuthMiddleware, (req, res, next) =>
  storeController.getProfile(req, res, next)
);

// Update store settings (Owner only)
router.patch(
  '/profile',
  authMiddleware,
  requireOwner,
  validate(validateUpdateStore),
  (req, res, next) => storeController.updateProfile(req, res, next)
);

export default router;

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { rateLimit } from '../middlewares/rateLimit';
import {
  validateStoreLogin,
  validateCustomerSendOtp,
  validateCustomerVerifyOtp,
} from '../validators/schemas';

const router = Router();

// Store Owner/Staff login via 4-digit PIN (rate limited: 10 attempts per minute)
router.post(
  '/store/login',
  rateLimit(10, 60 * 1000),
  validate(validateStoreLogin),
  (req, res, next) => authController.storeLogin(req, res, next)
);

// Customer Send OTP (rate limited: 5 requests per minute)
router.post(
  '/customer/send-otp',
  rateLimit(5, 60 * 1000),
  validate(validateCustomerSendOtp),
  (req, res, next) => authController.customerSendOtp(req, res, next)
);

// Customer Verify OTP (rate limited: 10 requests per minute)
router.post(
  '/customer/verify-otp',
  rateLimit(10, 60 * 1000),
  validate(validateCustomerVerifyOtp),
  (req, res, next) => authController.customerVerifyOtp(req, res, next)
);

// Get current authenticated user session
router.get('/session', authMiddleware, (req, res, next) =>
  authController.getCurrentSession(req, res, next)
);

export default router;

import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authMiddleware } from '../middlewares/auth';
import { requireOwner, requireStoreStaff } from '../middlewares/roles';
import { validate } from '../middlewares/validate';
import {
  validateCreateCustomer,
  validateUpdateCustomerReminder,
} from '../validators/schemas';

const router = Router();

// List customers with search/filter/sort (Store Owner & Staff)
router.get('/', authMiddleware, requireStoreStaff, (req, res, next) =>
  customerController.listCustomers(req, res, next)
);

// Get single customer by ID + their transactions (Store Staff or matching Customer)
router.get('/:id', authMiddleware, (req, res, next) =>
  customerController.getCustomerById(req, res, next)
);

// Create new customer (Store Owner & Staff)
router.post(
  '/',
  authMiddleware,
  requireStoreStaff,
  validate(validateCreateCustomer),
  (req, res, next) => customerController.createCustomer(req, res, next)
);

// Update customer reminder preference (Store Owner & Staff)
router.patch(
  '/:id/reminder-preference',
  authMiddleware,
  requireStoreStaff,
  validate(validateUpdateCustomerReminder),
  (req, res, next) => customerController.updateReminderPreference(req, res, next)
);

// Delete customer (Owner only)
router.delete('/:id', authMiddleware, requireOwner, (req, res, next) =>
  customerController.deleteCustomer(req, res, next)
);

export default router;

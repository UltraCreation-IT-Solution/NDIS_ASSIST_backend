// src/modules/wage-calculator/wageCalculator.routes.js

import { Router } from 'express';
import * as controller from './wageCalculator.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { calculateSchema, recalculateSchema } from './wageCalculator.validator.js';

const router = Router();

// On-demand wage calculation (preview/estimate)
router.post(
  '/calculate',
  authenticate,
  requirePermission('billing:read'),
  validate(calculateSchema),
  controller.calculate
);

// Recalculate an existing shift's wages
router.post(
  '/recalculate/:shiftId',
  authenticate,
  requirePermission('billing:write'),
  validate(recalculateSchema),
  controller.recalculate
);

export default router;
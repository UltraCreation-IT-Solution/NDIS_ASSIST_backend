// src/modules/pay-group/payGroup.routes.js

import { Router } from 'express';
import * as controller from './payGroup.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  getStaffSchema,
} from './payGroup.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('billing:read'),
  validate(listSchema),
  controller.list
);

router.post(
  '/',
  authenticate,
  requirePermission('billing:write'),
  validate(createSchema),
  controller.create
);

router.get(
  '/:id',
  authenticate,
  requirePermission('billing:read'),
  validate(getByIdSchema),
  controller.getById
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('billing:write'),
  validate(updateSchema),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('billing:write'),
  validate(deleteSchema),
  controller.remove
);

router.get(
  '/:id/staff',
  authenticate,
  requirePermission('billing:read'),
  validate(getStaffSchema),
  controller.getStaff
);

export default router;
// src/modules/public-holiday/publicHoliday.routes.js

import { Router } from 'express';
import * as controller from './publicHoliday.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  seedSchema,
} from './publicHoliday.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('settings:read'),
  validate(listSchema),
  controller.list
);

router.post(
  '/',
  authenticate,
  requirePermission('settings:write'),
  validate(createSchema),
  controller.create
);

router.post(
  '/seed',
  authenticate,
  requirePermission('settings:write'),
  validate(seedSchema),
  controller.seed
);

router.get(
  '/:id',
  authenticate,
  requirePermission('settings:read'),
  validate(getByIdSchema),
  controller.getById
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('settings:write'),
  validate(updateSchema),
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('settings:write'),
  validate(deleteSchema),
  controller.remove
);

export default router;
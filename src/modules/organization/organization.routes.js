/**
 * Organization Routes
 * ====================
 * 
 * Base path: /api/v1/platform/organizations
 */

import { Router } from 'express';
import * as orgController from './organization.controller.js';
import { authenticate, requireSuperAdmin } from '../../middleware/platformAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listOrganizationsSchema,
  getOrganizationSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
  suspendOrganizationSchema,
  activateOrganizationSchema,
  deleteOrganizationSchema,
} from './organization.validator.js';

const router = Router();

// All platform admins (read access)
router.get('/', authenticate, validate(listOrganizationsSchema), orgController.list);
router.get('/stats', authenticate, orgController.getStats);
router.get('/:id', authenticate, validate(getOrganizationSchema), orgController.getById);

// SUPER_ADMIN only (write access)
router.post('/', authenticate, requireSuperAdmin, validate(createOrganizationSchema), orgController.create);
router.patch('/:id', authenticate, requireSuperAdmin, validate(updateOrganizationSchema), orgController.update);
router.post('/:id/suspend', authenticate, requireSuperAdmin, validate(suspendOrganizationSchema), orgController.suspend);
router.post('/:id/activate', authenticate, requireSuperAdmin, validate(activateOrganizationSchema), orgController.activate);
router.delete('/:id', authenticate, requireSuperAdmin, validate(deleteOrganizationSchema), orgController.deactivate);

export default router;
/**
 * Shift Template Routes
 * =====================
 * 
 * Base path: /api/v1/shift-templates
 */

import { Router } from 'express';
import * as controller from './shiftTemplate.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listSchema,
  getByIdSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  toggleDefaultSchema,
  useSchema,
} from './shiftTemplate.validator.js';

const router = Router();

// ============================================================================
// READ ROUTES (scheduling:read)
// ============================================================================

/**
 * GET /shift-templates
 * List all shift templates for the organization
 */
router.get(
  '/',
  authenticate,
  requirePermission('scheduling:read'),
  validate(listSchema),
  controller.list
);

/**
 * GET /shift-templates/stats
 * Get template statistics
 */
router.get(
  '/stats',
  authenticate,
  requirePermission('scheduling:read'),
  controller.getStats
);

/**
 * GET /shift-templates/:id
 * Get single shift template by ID
 */
router.get(
  '/:id',
  authenticate,
  requirePermission('scheduling:read'),
  validate(getByIdSchema),
  controller.getById
);

// ============================================================================
// WRITE ROUTES (scheduling:write)
// ============================================================================

/**
 * POST /shift-templates
 * Create new shift template
 */
router.post(
  '/',
  authenticate,
  requirePermission('scheduling:write'),
  validate(createSchema),
  controller.create
);

/**
 * PATCH /shift-templates/:id
 * Update shift template
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission('scheduling:write'),
  validate(updateSchema),
  controller.update
);

/**
 * DELETE /shift-templates/:id
 * Delete shift template (soft delete by default, hard delete with ?hard=true)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('scheduling:write'),
  validate(deleteSchema),
  controller.remove
);

/**
 * POST /shift-templates/:id/toggle-default
 * Toggle template default status
 */
router.post(
  '/:id/toggle-default',
  authenticate,
  requirePermission('scheduling:write'),
  validate(toggleDefaultSchema),
  controller.toggleDefault
);

/**
 * POST /shift-templates/:id/use
 * Record template usage (called when creating shift from template)
 */
router.post(
  '/:id/use',
  authenticate,
  requirePermission('scheduling:read'),
  validate(useSchema),
  controller.recordUsage
);

export default router;

/**
 * User Routes
 * ============
 * 
 * Base path: /api/v1/users
 */

import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  listUsersSchema,
  getUserSchema,
  inviteUserSchema,
  acceptInviteSchema,
  updateUserSchema,
  userIdParamSchema,
  listInvitationsSchema,
} from './user.validator.js';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

router.post('/accept-invite', validate(acceptInviteSchema), userController.acceptInvite);

// ============================================================================
// PROTECTED ROUTES - READ (users:read)
// ============================================================================

router.get('/', authenticate, requirePermission('users:read'), validate(listUsersSchema), userController.list);
router.get('/invitations', authenticate, requirePermission('users:read'), validate(listInvitationsSchema), userController.listInvitations);
router.get('/:id', authenticate, requirePermission('users:read'), validate(getUserSchema), userController.getById);

// ============================================================================
// PROTECTED ROUTES - WRITE (users:write)
// ============================================================================

router.post('/invite', authenticate, requirePermission('users:write'), validate(inviteUserSchema), userController.invite);
router.patch('/:id', authenticate, requirePermission('users:write'), validate(updateUserSchema), userController.update);
router.delete('/:id', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.deactivate);
router.post('/:id/reactivate', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.reactivate);
router.post('/:id/resend-invite', authenticate, requirePermission('users:write'), validate(userIdParamSchema), userController.resendInvite);

// ============================================================================
// EXPORT
// ============================================================================

export default router;
/**
 * User Controller
 * ================
 * 
 * HTTP handlers for User Management within an Organization
 */

import * as userService from './user.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// ============================================================================
// LIST & GET
// ============================================================================

/**
 * GET /api/v1/users
 */
export async function list(req, res) {
  const result = await userService.listUsers(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Users retrieved successfully');
}

/**
 * GET /api/v1/users/:id
 */
export async function getById(req, res) {
  const user = await userService.getUser(req.organizationId, req.params.id);
  return success(res, user, 'User retrieved successfully');
}

// ============================================================================
// INVITE
// ============================================================================

/**
 * POST /api/v1/users/invite
 */
export async function invite(req, res) {
  const result = await userService.inviteUser(
    req.organizationId, 
    req.body, 
    req.user.id
  );
  return created(res, result, 'Invitation sent successfully');
}

/**
 * POST /api/v1/users/accept-invite (Public)
 */
export async function acceptInvite(req, res) {
  const { token, password } = req.body;
  const result = await userService.acceptInvite(token, password);
  return success(res, result, 'Invitation accepted successfully');
}

// ============================================================================
// UPDATE & STATUS
// ============================================================================

/**
 * PATCH /api/v1/users/:id
 */
export async function update(req, res) {
  const user = await userService.updateUser(
    req.organizationId, 
    req.params.id, 
    req.body,
    req.user
  );
  return success(res, user, 'User updated successfully');
}

/**
 * DELETE /api/v1/users/:id
 */
export async function deactivate(req, res) {
  const user = await userService.deactivateUser(
    req.organizationId, 
    req.params.id,
    req.user
  );
  return success(res, user, 'User deactivated successfully');
}

/**
 * POST /api/v1/users/:id/reactivate
 */
export async function reactivate(req, res) {
  const user = await userService.reactivateUser(req.organizationId, req.params.id);
  return success(res, user, 'User reactivated successfully');
}

// ============================================================================
// RESEND INVITE
// ============================================================================

/**
 * POST /api/v1/users/:id/resend-invite
 */
export async function resendInvite(req, res) {
  const result = await userService.resendInvite(
    req.organizationId, 
    req.params.id,
    req.user.id
  );
  return success(res, result, 'Invitation resent successfully');
}

// ============================================================================
// INVITATIONS
// ============================================================================

/**
 * GET /api/v1/users/invitations
 */
export async function listInvitations(req, res) {
  const result = await userService.listInvitations(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Invitations retrieved successfully');
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  list,
  getById,
  invite,
  acceptInvite,
  update,
  deactivate,
  reactivate,
  resendInvite,
  listInvitations,
};
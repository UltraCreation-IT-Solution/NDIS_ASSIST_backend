/**
 * User Service
 * =============
 * 
 * Business logic for managing users within an Organization
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as userRepo from './user.repository.js';
import { 
  NotFoundError, 
  ConflictError, 
  BadRequestError,
  ForbiddenError,
} from '../../shared/errors/AppError.js';
import { SECURITY, ORGANIZATION } from '../../config/constants.js';

// ============================================================================
// HELPERS
// ============================================================================

async function hashPassword(password) {
  return bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS);
}

function generateInviteToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getInviteExpiry(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ============================================================================
// LIST & GET
// ============================================================================

/**
 * List users in organization
 */
export async function listUsers(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;
  
  const { data, total } = await userRepo.findAll(organizationId, options);
  
  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get user by ID
 */
export async function getUser(organizationId, userId) {
  const user = await userRepo.findById(organizationId, userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return user;
}

// ============================================================================
// INVITE USER
// ============================================================================

/**
 * Invite a new user to the organization
 * 
 * Flow:
 * 1. Check email not already in org
 * 2. Check no pending invite exists
 * 3. Create User (status: INVITED, no password)
 * 4. Create UserInvitation with token
 * 5. Send email (TODO)
 */
export async function inviteUser(organizationId, data, invitedBy) {
  const { email, role, firstName, lastName, phone } = data;
  
  // Check if user already exists in this org
  const existingUser = await userRepo.findByEmail(organizationId, email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists in the organization');
  }
  
  // Check if there's already a pending invite
  const existingInvite = await userRepo.findInvitationByEmail(organizationId, email);
  if (existingInvite) {
    throw new ConflictError('A pending invitation already exists for this email');
  }
  
  // Cannot invite another ORG_OWNER
  if (role === 'ORG_OWNER') {
    throw new ForbiddenError('Cannot invite another organization owner');
  }
  
  // Create user with INVITED status (no password yet)
  const user = await userRepo.create({
    organizationId,
    email: email.toLowerCase(),
    firstName,
    lastName,
    phone,
    role,
    status: 'INVITED',
  });
  
  // Create invitation token
  const token = generateInviteToken();
  const expiresAt = getInviteExpiry(7); // 7 days
  
  const invitation = await userRepo.createInvitation({
    organizationId,
    email: email.toLowerCase(),
    role,
    token,
    invitedBy,
    expiresAt,
  });
  
  // TODO: Send invitation email with link
  console.log(`Invite token for ${email}: ${token}`);
  
  return {
    user,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      token: invitation.token,
    },
  };
}

// ============================================================================
// ACCEPT INVITE
// ============================================================================

/**
 * Accept invitation and set password
 */
export async function acceptInvite(token, password) {
  // Find invitation
  const invitation = await userRepo.findInvitationByToken(token);
  
  if (!invitation) {
    throw new BadRequestError('Invalid invitation token');
  }
  
  if (invitation.status !== 'PENDING') {
    throw new BadRequestError('Invitation has already been used or cancelled');
  }
  
  if (new Date() > invitation.expiresAt) {
    await userRepo.updateInvitation(invitation.id, { status: 'EXPIRED' });
    throw new BadRequestError('Invitation has expired. Please request a new one.');
  }
  
  // Find the user created during invite
  const user = await userRepo.findByEmail(invitation.organizationId, invitation.email);
  
  if (!user) {
    throw new NotFoundError('User account not found');
  }
  
  // Hash password and activate user
  const passwordHash = await hashPassword(password);
  
  const updatedUser = await userRepo.update(user.id, {
    passwordHash,
    status: 'ACTIVE',
  });
  
  // Mark invitation as accepted
  await userRepo.updateInvitation(invitation.id, {
    status: 'ACCEPTED',
    acceptedAt: new Date(),
  });
  
  return {
    message: 'Invitation accepted successfully',
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    },
    organization: {
      id: invitation.organization.id,
      name: invitation.organization.name,
      slug: invitation.organization.slug,
    },
  };
}

// ============================================================================
// UPDATE USER
// ============================================================================

/**
 * Update user details (role, status, etc.)
 */
export async function updateUser(organizationId, userId, data, requestingUser) {
  const user = await userRepo.findById(organizationId, userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Cannot modify ORG_OWNER
  if (user.role === 'ORG_OWNER' && requestingUser.role !== 'ORG_OWNER') {
    throw new ForbiddenError('Cannot modify organization owner');
  }
  
  // Cannot change role to ORG_OWNER
  if (data.role === 'ORG_OWNER') {
    throw new ForbiddenError('Cannot assign organization owner role');
  }
  
  // Cannot modify your own role
  if (userId === requestingUser.id && data.role) {
    throw new BadRequestError('Cannot change your own role');
  }
  
  const updated = await userRepo.update(userId, data);
  
  return updated;
}

// ============================================================================
// DEACTIVATE / REACTIVATE
// ============================================================================

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(organizationId, userId, requestingUser) {
  const user = await userRepo.findById(organizationId, userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Cannot deactivate ORG_OWNER
  if (user.role === 'ORG_OWNER') {
    throw new ForbiddenError('Cannot deactivate organization owner');
  }
  
  // Cannot deactivate yourself
  if (userId === requestingUser.id) {
    throw new BadRequestError('Cannot deactivate your own account');
  }
  
  const updated = await userRepo.update(userId, { status: 'DISABLED' });
  
  return updated;
}

/**
 * Reactivate user
 */
export async function reactivateUser(organizationId, userId) {
  const user = await userRepo.findById(organizationId, userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (user.status === 'ACTIVE') {
    throw new BadRequestError('User is already active');
  }
  
  const updated = await userRepo.update(userId, { status: 'ACTIVE' });
  
  return updated;
}

// ============================================================================
// RESEND INVITE
// ============================================================================

/**
 * Resend invitation to user
 */
export async function resendInvite(organizationId, userId, invitedBy) {
  const user = await userRepo.findById(organizationId, userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (user.status !== 'INVITED') {
    throw new BadRequestError('User has already accepted the invitation');
  }
  
  // Cancel any existing pending invites
  const existingInvite = await userRepo.findInvitationByEmail(organizationId, user.email);
  if (existingInvite) {
    await userRepo.updateInvitation(existingInvite.id, { status: 'CANCELLED' });
  }
  
  // Create new invitation
  const token = generateInviteToken();
  const expiresAt = getInviteExpiry(7);
  
  const invitation = await userRepo.createInvitation({
    organizationId,
    email: user.email,
    role: user.role,
    token,
    invitedBy,
    expiresAt,
  });
  
  // TODO: Send email
  console.log(`Resent invite token for ${user.email}: ${token}`);
  
  return {
    message: 'Invitation resent successfully',
    invitation: {
      id: invitation.id,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      token: invitation.token,
    },
  };
}

// ============================================================================
// INVITATIONS LIST
// ============================================================================

/**
 * List all invitations for organization
 */
export async function listInvitations(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;
  
  const { data, total } = await userRepo.listInvitations(organizationId, options);
  
  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  listUsers,
  getUser,
  inviteUser,
  acceptInvite,
  updateUser,
  deactivateUser,
  reactivateUser,
  resendInvite,
  listInvitations,
};

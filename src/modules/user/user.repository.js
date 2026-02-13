/**
 * User Repository
 * ================
 * 
 * Database queries for User Management within an Organization
 */

import prisma from '../../config/database.js';

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Find all users in an organization with pagination and filters
 */
export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(role && { role }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        customRole: {
          select: { id: true, name: true },
        },
        staffProfile: {
          select: {
            id: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

/**
 * Find user by ID within organization
 */
export async function findById(organizationId, userId) {
  return prisma.user.findFirst({
    where: { 
      id: userId, 
      organizationId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      customRoleId: true,
      status: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      customRole: {
        select: { id: true, name: true, permissions: true },
      },
      staffProfile: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
}

/**
 * Find user by email within organization
 */
export async function findByEmail(organizationId, email) {
  return prisma.user.findFirst({
    where: {
      organizationId,
      email: email.toLowerCase(),
    },
  });
}

/**
 * Create user
 */
export async function create(data) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

/**
 * Update user
 */
export async function update(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      customRoleId: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      customRole: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Count users by role in organization
 */
export async function countByRole(organizationId) {
  return prisma.user.groupBy({
    by: ['role'],
    where: { organizationId },
    _count: { role: true },
  });
}

/**
 * Count active users in organization
 */
export async function countActive(organizationId) {
  return prisma.user.count({
    where: { 
      organizationId, 
      status: 'ACTIVE',
    },
  });
}

// ============================================================================
// INVITATION QUERIES
// ============================================================================

/**
 * Create invitation
 */
export async function createInvitation(data) {
  return prisma.userInvitation.create({
    data,
  });
}

/**
 * Find invitation by token
 */
export async function findInvitationByToken(token) {
  return prisma.userInvitation.findUnique({
    where: { token },
    include: {
      organization: true,
    },
  });
}

/**
 * Find invitation by email in organization
 */
export async function findInvitationByEmail(organizationId, email) {
  return prisma.userInvitation.findFirst({
    where: {
      organizationId,
      email: email.toLowerCase(),
      status: 'PENDING',
    },
  });
}

/**
 * Find invitation by ID
 */
export async function findInvitationById(id) {
  return prisma.userInvitation.findUnique({
    where: { id },
  });
}

/**
 * Update invitation
 */
export async function updateInvitation(id, data) {
  return prisma.userInvitation.update({
    where: { id },
    data,
  });
}

/**
 * List invitations for organization
 */
export async function listInvitations(organizationId, options = {}) {
  const { status, page = 1, limit = 20 } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.userInvitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.userInvitation.count({ where }),
  ]);

  return { data, total };
}

/**
 * Delete invitation
 */
export async function deleteInvitation(id) {
  return prisma.userInvitation.delete({
    where: { id },
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  countByRole,
  countActive,
  createInvitation,
  findInvitationByToken,
  findInvitationByEmail,
  findInvitationById,
  updateInvitation,
  listInvitations,
  deleteInvitation,
};

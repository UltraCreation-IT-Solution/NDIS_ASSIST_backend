/**
 * Organization Repository
 * ========================
 * 
 * Database queries for Organization module
 * Used by Platform Admin to manage organizations
 */

import prisma from '../../config/database.js';

// ============================================================================
// ORGANIZATION QUERIES
// ============================================================================

/**
 * Find all organizations with pagination and filters
 * 
 * @param {object} options - Query options
 * @returns {Promise<{data: Array, total: number}>}
 */
export async function findAll(options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    subscriptionPlan,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  // Build where clause
  const where = {
    ...(status && { status }),
    ...(subscriptionPlan && {
      subscription: {
        plan: subscriptionPlan,
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { abn: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            trialEndsAt: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            users: true,
            staffMembers: true,
            clients: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where }),
  ]);

  return { data, total };
}

/**
 * Find organization by ID
 */
export async function findById(id) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      subscription: true,
      _count: {
        select: {
          users: true,
          staffMembers: true,
          clients: true,
        },
      },
    },
  });
}

/**
 * Find organization by slug
 */
export async function findBySlug(slug) {
  return prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Find organization by ABN
 */
export async function findByAbn(abn) {
  return prisma.organization.findUnique({
    where: { abn },
  });
}

/**
 * Find organization by NDIS Registration Number
 */
export async function findByNdisRegistrationNo(ndisRegistrationNo) {
  return prisma.organization.findUnique({
    where: { ndisRegistrationNo },
  });
}

/**
 * Create organization with subscription
 */
export async function create(data, subscriptionData) {
  return prisma.organization.create({
    data: {
      ...data,
      subscription: {
        create: subscriptionData,
      },
    },
    include: {
      subscription: true,
    },
  });
}

/**
 * Update organization
 */
export async function update(id, data) {
  return prisma.organization.update({
    where: { id },
    data,
    include: {
      subscription: true,
      _count: {
        select: {
          users: true,
          staffMembers: true,
          clients: true,
        },
      },
    },
  });
}

/**
 * Update organization status
 */
export async function updateStatus(id, status) {
  return prisma.organization.update({
    where: { id },
    data: { status },
    include: {
      subscription: true,
    },
  });
}

/**
 * Delete organization (hard delete - use with caution)
 */
export async function deleteById(id) {
  return prisma.organization.delete({
    where: { id },
  });
}

/**
 * Get organization stats for platform dashboard
 */
export async function getStats() {
  const [total, byStatus, byPlan] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.subscription.groupBy({
      by: ['plan'],
      _count: { plan: true },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
    byPlan: byPlan.reduce((acc, item) => {
      acc[item.plan] = item._count.plan;
      return acc;
    }, {}),
  };
}

export default {
  findAll,
  findById,
  findBySlug,
  findByAbn,
  findByNdisRegistrationNo,
  create,
  update,
  updateStatus,
  deleteById,
  getStats,
};
/**
 * Shift Template Repository
 * =========================
 * Database operations for shift templates
 */

import prisma from '../../config/database.js';

/**
 * Find all shift templates for an organization
 */
export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    serviceTypeId,
    isDefault,
    isActive = true,
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  const where = {
    organizationId,
    ...(isActive !== undefined && { isActive }),
    ...(isDefault !== undefined && { isDefault }),
    ...(serviceTypeId && { serviceTypeId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.shiftTemplate.findMany({
      where,
      include: {
        serviceType: {
          select: {
            id: true,
            serviceName: true,
            serviceCode: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shiftTemplate.count({ where }),
  ]);

  return { data, total };
}

/**
 * Find shift template by ID
 */
export async function findById(id, organizationId) {
  return prisma.shiftTemplate.findFirst({
    where: { id, organizationId },
    include: {
      serviceType: {
        select: {
          id: true,
          serviceName: true,
          serviceCode: true,
          defaultRate: true,
        },
      },
    },
  });
}

/**
 * Find template by name (for uniqueness check)
 */
export async function findByName(organizationId, name, excludeId = null) {
  return prisma.shiftTemplate.findFirst({
    where: {
      organizationId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
}

/**
 * Create shift template
 */
export async function create(data) {
  return prisma.shiftTemplate.create({
    data,
    include: {
      serviceType: {
        select: {
          id: true,
          serviceName: true,
          serviceCode: true,
        },
      },
    },
  });
}

/**
 * Update shift template
 */
export async function update(id, organizationId, data) {
  return prisma.shiftTemplate.update({
    where: { id },
    data,
    include: {
      serviceType: {
        select: {
          id: true,
          serviceName: true,
          serviceCode: true,
        },
      },
    },
  });
}

/**
 * Delete shift template (soft delete by setting isActive = false)
 */
export async function softDelete(id, organizationId) {
  return prisma.shiftTemplate.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Hard delete shift template
 */
export async function hardDelete(id, organizationId) {
  return prisma.shiftTemplate.delete({
    where: { id },
  });
}

/**
 * Increment usage count
 */
export async function incrementUsage(id) {
  return prisma.shiftTemplate.update({
    where: { id },
    data: {
      usageCount: { increment: 1 },
    },
  });
}

/**
 * Get template statistics
 */
export async function getStats(organizationId) {
  const [total, defaultCount, mostUsed] = await Promise.all([
    prisma.shiftTemplate.count({
      where: { organizationId, isActive: true },
    }),
    prisma.shiftTemplate.count({
      where: { organizationId, isActive: true, isDefault: true },
    }),
    prisma.shiftTemplate.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { usageCount: 'desc' },
      select: { name: true, usageCount: true },
    }),
  ]);

  return {
    total,
    defaultCount,
    mostUsed: mostUsed?.name || null,
    mostUsedCount: mostUsed?.usageCount || 0,
  };
}

export default {
  findAll,
  findById,
  findByName,
  create,
  update,
  softDelete,
  hardDelete,
  incrementUsage,
  getStats,
};

// src/modules/pay-group/payGroup.repository.js

import prisma from '../../config/database.js';

export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where = {
    organizationId,
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.payGroup.findMany({
      where,
      include: {
        _count: { select: { staffMembers: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payGroup.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id, organizationId) {
  return prisma.payGroup.findFirst({
    where: { id, organizationId },
    include: {
      _count: { select: { staffMembers: true } },
    },
  });
}

export async function findByName(organizationId, name) {
  return prisma.payGroup.findFirst({
    where: {
      organizationId,
      name: { equals: name, mode: 'insensitive' },
    },
  });
}

export async function create(data) {
  return prisma.payGroup.create({
    data,
    include: {
      _count: { select: { staffMembers: true } },
    },
  });
}

export async function update(id, organizationId, data) {
  return prisma.payGroup.update({
    where: { id },
    data,
    include: {
      _count: { select: { staffMembers: true } },
    },
  });
}

export async function softDelete(id, organizationId) {
  return prisma.payGroup.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function findStaffByPayGroup(id, organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;

  const where = {
    payGroupId: id,
    organizationId,
  };

  const [data, total] = await Promise.all([
    prisma.staffMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.staffMember.count({ where }),
  ]);

  return { data, total };
}

export default {
  findAll,
  findById,
  findByName,
  create,
  update,
  softDelete,
  findStaffByPayGroup,
};
// src/modules/public-holiday/publicHoliday.repository.js

import prisma from '../../config/database.js';

export async function findAll(organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    year,
    state,
    isNational,
    search,
    sortBy = 'holidayDate',
    sortOrder = 'asc',
  } = options;

  // Show org-specific holidays + system-wide national holidays (organizationId = null)
  const where = {
    OR: [
      { organizationId },
      { organizationId: null, isNational: true },
    ],
    ...(typeof isNational === 'boolean' && { isNational }),
    ...(state && { state }),
    ...(search && {
      holidayName: { contains: search, mode: 'insensitive' },
    }),
    ...(year && {
      holidayDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.publicHoliday.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publicHoliday.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id) {
  return prisma.publicHoliday.findUnique({
    where: { id },
  });
}

export async function findByDateAndState(organizationId, holidayDate, state) {
  return prisma.publicHoliday.findFirst({
    where: {
      OR: [
        { organizationId, holidayDate, state },
        { organizationId: null, holidayDate, state },
        { organizationId: null, holidayDate, isNational: true },
        { organizationId, holidayDate, isNational: true },
      ],
    },
  });
}

export async function isPublicHoliday(organizationId, date, state = null) {
  // Check if a given date is a public holiday (org-specific or national)
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const holiday = await prisma.publicHoliday.findFirst({
    where: {
      OR: [
        { organizationId, holidayDate: { gte: startOfDay, lte: endOfDay } },
        { organizationId: null, isNational: true, holidayDate: { gte: startOfDay, lte: endOfDay } },
        ...(state
          ? [
              { organizationId: null, state, holidayDate: { gte: startOfDay, lte: endOfDay } },
              { organizationId, state, holidayDate: { gte: startOfDay, lte: endOfDay } },
            ]
          : []),
      ],
    },
  });

  return holiday;
}

export async function create(data) {
  return prisma.publicHoliday.create({ data });
}

export async function createMany(data) {
  return prisma.publicHoliday.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function update(id, data) {
  return prisma.publicHoliday.update({
    where: { id },
    data,
  });
}

export async function remove(id) {
  return prisma.publicHoliday.delete({
    where: { id },
  });
}

export default {
  findAll,
  findById,
  findByDateAndState,
  isPublicHoliday,
  create,
  createMany,
  update,
  remove,
};
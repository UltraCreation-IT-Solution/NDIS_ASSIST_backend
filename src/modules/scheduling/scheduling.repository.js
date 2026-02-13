// src/modules/scheduling/scheduling.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// SHIFTS
// ============================================================================

export async function findAllShifts(organizationId, options = {}) {
  const page = Number(options.page) || 1;
const limit = Number(options.limit) || 20;
  const {
    search,
    status,
    staffId,
    clientId,
    serviceTypeId,
    dateFrom,
    dateTo,
    rateType,
    sortBy = 'scheduledStart',
    sortOrder = 'asc',
  } = options;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(staffId && { staffId }),
    ...(clientId && { clientId }),
    ...(serviceTypeId && { serviceTypeId }),
    ...(rateType && { rateType }),
    ...(dateFrom || dateTo
      ? {
          scheduledStart: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(search && {
      OR: [
        { notes: { contains: search, mode: 'insensitive' } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { staff: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { staff: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.shift.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, ndisNumber: true } },
        staff: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        serviceType: { select: { id: true, serviceName: true, serviceCode: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shift.count({ where }),
  ]);

  return { data, total };
}

export async function findShiftById(id, organizationId) {
  return prisma.shift.findFirst({
    where: { id, organizationId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, ndisNumber: true, phone: true } },
      staff: {
        select: {
          id: true,
          employeeId: true,
          hourlyRate: true,
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      },
      serviceType: true,
      progressNotes: { orderBy: { createdAt: 'desc' } },
      clockEvents: { orderBy: { timestamp: 'asc' } },
      swaps: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createShift(data) {
  return prisma.shift.create({
    data,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      staff: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      serviceType: { select: { id: true, serviceName: true, serviceCode: true } },
    },
  });
}

export async function updateShift(id, data) {
  return prisma.shift.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      staff: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      serviceType: { select: { id: true, serviceName: true, serviceCode: true } },
    },
  });
}

export async function findConflictingShifts(organizationId, staffId, scheduledStart, scheduledEnd, excludeId = null) {
  return prisma.shift.findMany({
    where: {
      organizationId,
      staffId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      ...(excludeId && { id: { not: excludeId } }),
      OR: [
        { scheduledStart: { gte: scheduledStart, lt: scheduledEnd } },
        { scheduledEnd: { gt: scheduledStart, lte: scheduledEnd } },
        { AND: [{ scheduledStart: { lte: scheduledStart } }, { scheduledEnd: { gte: scheduledEnd } }] },
      ],
    },
  });
}

// ============================================================================
// PROGRESS NOTES
// ============================================================================

export async function findProgressNotes(shiftId) {
  return prisma.shiftProgressNote.findMany({
    where: { shiftId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findProgressNoteById(id, shiftId) {
  return prisma.shiftProgressNote.findFirst({
    where: { id, shiftId },
  });
}

export async function createProgressNote(data) {
  return prisma.shiftProgressNote.create({ data });
}

export async function updateProgressNote(id, data) {
  return prisma.shiftProgressNote.update({ where: { id }, data });
}

// ============================================================================
// CLOCK EVENTS
// ============================================================================

export async function findClockEvents(shiftId) {
  return prisma.clockEvent.findMany({
    where: { shiftId },
    orderBy: { timestamp: 'asc' },
  });
}

export async function createClockEvent(data) {
  return prisma.clockEvent.create({ data });
}

export async function findLastClockEvent(shiftId, staffId) {
  return prisma.clockEvent.findFirst({
    where: { shiftId, staffId },
    orderBy: { timestamp: 'desc' },
  });
}

// ============================================================================
// SHIFT SWAPS
// ============================================================================

export async function findShiftSwaps(organizationId, options = {}) {
    const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 20;
  const {  status } = options;

  const where = {
    shift: { organizationId },
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.shiftSwap.findMany({
      where,
      include: {
        shift: { select: { id: true, scheduledStart: true, scheduledEnd: true } },
        originalStaff: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
        newStaff: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shiftSwap.count({ where }),
  ]);

  return { data, total };
}

export async function findShiftSwapById(id) {
  return prisma.shiftSwap.findUnique({
    where: { id },
    include: {
      shift: true,
      originalStaff: {
        select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
      },
      newStaff: {
        select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });
}

export async function createShiftSwap(data) {
  return prisma.shiftSwap.create({
    data,
    include: {
      shift: { select: { id: true, scheduledStart: true, scheduledEnd: true } },
      originalStaff: {
        select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
      },
      newStaff: {
        select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });
}

export async function updateShiftSwap(id, data) {
  return prisma.shiftSwap.update({ where: { id }, data });
}

// ============================================================================
// RECURRING SHIFT PATTERNS
// ============================================================================

export async function findRecurringPatterns(organizationId, options = {}) {
    const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 20;
  const { isActive, clientId, staffId } = options;

  const where = {
    organizationId,
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(clientId && { clientId }),
    ...(staffId && { staffId }),
  };

  const [data, total] = await Promise.all([
    prisma.recurringShiftPattern.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        staff: {
          select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.recurringShiftPattern.count({ where }),
  ]);

  return { data, total };
}

export async function findRecurringPatternById(id, organizationId) {
  return prisma.recurringShiftPattern.findFirst({
    where: { id, organizationId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      staff: {
        select: { id: true, employeeId: true, user: { select: { firstName: true, lastName: true } } },
      },
    },
  });
}

export async function createRecurringPattern(data) {
  return prisma.recurringShiftPattern.create({ data });
}

export async function updateRecurringPattern(id, data) {
  return prisma.recurringShiftPattern.update({ where: { id }, data });
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export async function findServiceTypes(organizationId, options = {}) {
    const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 20;
  const { isActive, search } = options;

  const where = {
    organizationId,
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(search && {
      OR: [
        { serviceName: { contains: search, mode: 'insensitive' } },
        { serviceCode: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.serviceType.findMany({
      where,
      orderBy: { serviceName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceType.count({ where }),
  ]);

  return { data, total };
}

export async function findServiceTypeById(id, organizationId) {
  return prisma.serviceType.findFirst({
    where: { id, organizationId },
  });
}

export async function findServiceTypeByCode(organizationId, serviceCode) {
  return prisma.serviceType.findFirst({
    where: { organizationId, serviceCode },
  });
}

export async function createServiceType(data) {
  return prisma.serviceType.create({ data });
}

export async function updateServiceType(id, data) {
  return prisma.serviceType.update({ where: { id }, data });
}

export default {
  findAllShifts,
  findShiftById,
  createShift,
  updateShift,
  findConflictingShifts,
  findProgressNotes,
  findProgressNoteById,
  createProgressNote,
  updateProgressNote,
  findClockEvents,
  createClockEvent,
  findLastClockEvent,
  findShiftSwaps,
  findShiftSwapById,
  createShiftSwap,
  updateShiftSwap,
  findRecurringPatterns,
  findRecurringPatternById,
  createRecurringPattern,
  updateRecurringPattern,
  findServiceTypes,
  findServiceTypeById,
  findServiceTypeByCode,
  createServiceType,
  updateServiceType,
};

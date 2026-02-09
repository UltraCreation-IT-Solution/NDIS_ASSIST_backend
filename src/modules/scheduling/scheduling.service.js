// src/modules/scheduling/scheduling.service.js

import * as repo from './scheduling.repository.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../shared/errors/AppError.js';

// Optional wage calculator — gracefully skip if module not yet built
let autoCalculateForShift = null;
try {
  const mod = await import('../wage-calculator/wageCalculator.service.js');
  autoCalculateForShift = mod.autoCalculateForShift;
} catch {
  // wage-calculator module not available yet — shift wage auto-calc disabled
}

// ============================================================================
// SHIFTS
// ============================================================================

export async function listShifts(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllShifts(organizationId, options);

  return {
    data,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getShiftById(organizationId, shiftId) {
  const shift = await repo.findShiftById(shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');
  return shift;
}

export async function createShift(organizationId, data) {
  const scheduledStart = new Date(data.scheduledStart);
  const scheduledEnd = new Date(data.scheduledEnd);

  if (scheduledEnd <= scheduledStart) {
    throw new BadRequestError('Shift end time must be after start time');
  }

  // Verify service type exists
  const serviceType = await repo.findServiceTypeById(data.serviceTypeId, organizationId);
  if (!serviceType) throw new NotFoundError('Service type not found');

  // Check for staff conflicts
  if (data.staffId) {
    const conflicts = await repo.findConflictingShifts(organizationId, data.staffId, scheduledStart, scheduledEnd);
    if (conflicts.length > 0) {
      throw new ConflictError('Staff member has a conflicting shift during this time');
    }
  }

  // Auto-calculate wages if staff assigned and wage-calculator module is available
  let wageData = {};
  if (data.staffId && autoCalculateForShift) {
    try {
      const calculated = await autoCalculateForShift(organizationId, {
        staffId: data.staffId,
        scheduledStart,
        scheduledEnd,
        breakMinutes: data.breakMinutes || 0,
      });
      if (calculated) wageData = calculated;
    } catch {
      // wage calculation failed — continue without auto-calc
    }
  }

  return repo.createShift({
    organizationId,
    ...data,
    scheduledStart,
    scheduledEnd,
    ...wageData,
  });
}

export async function updateShift(organizationId, shiftId, data) {
  const shift = await repo.findShiftById(shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');

  if (['COMPLETED', 'INVOICED', 'CANCELLED'].includes(shift.status)) {
    throw new BadRequestError(`Cannot update a shift with status ${shift.status}`);
  }

  const updateData = { ...data };
  if (data.scheduledStart) updateData.scheduledStart = new Date(data.scheduledStart);
  if (data.scheduledEnd) updateData.scheduledEnd = new Date(data.scheduledEnd);
  if (data.actualStart) updateData.actualStart = new Date(data.actualStart);
  if (data.actualEnd) updateData.actualEnd = new Date(data.actualEnd);

  const start = updateData.scheduledStart || shift.scheduledStart;
  const end = updateData.scheduledEnd || shift.scheduledEnd;

  // Re-check conflicts if staff or time changed
  const staffId = data.staffId || shift.staffId;
  if (staffId && (data.staffId || data.scheduledStart || data.scheduledEnd)) {
    const conflicts = await repo.findConflictingShifts(organizationId, staffId, start, end, shiftId);
    if (conflicts.length > 0) {
      throw new ConflictError('Staff member has a conflicting shift during this time');
    }
  }

  // Re-calculate wages if relevant fields changed and wage-calculator is available
  if (staffId && autoCalculateForShift && (data.staffId || data.scheduledStart || data.scheduledEnd || data.breakMinutes !== undefined)) {
    try {
      const calculated = await autoCalculateForShift(organizationId, {
        staffId,
        scheduledStart: start,
        scheduledEnd: end,
        breakMinutes: data.breakMinutes ?? shift.breakMinutes ?? 0,
      });
      if (calculated) Object.assign(updateData, calculated);
    } catch {
      // wage calculation failed — continue without auto-calc
    }
  }

  return repo.updateShift(shiftId, updateData);
}

export async function cancelShift(organizationId, shiftId, reason) {
  const shift = await repo.findShiftById(shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');

  if (['COMPLETED', 'INVOICED', 'CANCELLED'].includes(shift.status)) {
    throw new BadRequestError(`Cannot cancel a shift with status ${shift.status}`);
  }

  return repo.updateShift(shiftId, {
    status: 'CANCELLED',
    cancellationReason: reason || null,
  });
}

// ============================================================================
// PROGRESS NOTES
// ============================================================================

export async function listProgressNotes(organizationId, shiftId) {
  await ensureShiftExists(organizationId, shiftId);
  return repo.findProgressNotes(shiftId);
}

export async function createProgressNote(organizationId, shiftId, data) {
  await ensureShiftExists(organizationId, shiftId);
  return repo.createProgressNote({ shiftId, ...data });
}

export async function updateProgressNote(organizationId, shiftId, noteId, data) {
  await ensureShiftExists(organizationId, shiftId);

  const note = await repo.findProgressNoteById(noteId, shiftId);
  if (!note) throw new NotFoundError('Progress note not found');

  return repo.updateProgressNote(noteId, data);
}

// ============================================================================
// CLOCK EVENTS
// ============================================================================

export async function listClockEvents(organizationId, shiftId) {
  await ensureShiftExists(organizationId, shiftId);
  return repo.findClockEvents(shiftId);
}

export async function recordClockEvent(organizationId, shiftId, data) {
  const shift = await repo.findShiftById(shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');

  if (!shift.staffId) {
    throw new BadRequestError('Shift has no staff assigned');
  }

  // Validate action sequence
  const lastEvent = await repo.findLastClockEvent(shiftId, data.staffId || shift.staffId);
  validateClockSequence(lastEvent?.action, data.action);

  const event = await repo.createClockEvent({
    shiftId,
    staffId: data.staffId || shift.staffId,
    action: data.action,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    accuracy: data.accuracy || null,
    address: data.address || null,
    isWithinGeofence: data.isWithinGeofence ?? null,
    photoUrl: data.photoUrl || null,
    deviceInfo: data.deviceInfo || null,
  });

  // Auto-update shift status based on clock action
  if (data.action === 'CLOCK_IN' && shift.status !== 'IN_PROGRESS') {
    await repo.updateShift(shiftId, {
      status: 'IN_PROGRESS',
      actualStart: event.timestamp,
    });
  } else if (data.action === 'CLOCK_OUT') {
    await repo.updateShift(shiftId, {
      status: 'PENDING_APPROVAL',
      actualEnd: event.timestamp,
    });
  }

  return event;
}

// ============================================================================
// SHIFT SWAPS
// ============================================================================

export async function listShiftSwaps(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findShiftSwaps(organizationId, options);

  return {
    data,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createShiftSwap(organizationId, data) {
  const shift = await repo.findShiftById(data.shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');

  if (data.originalStaffId === data.newStaffId) {
    throw new BadRequestError('Original and new staff cannot be the same');
  }

  // Check new staff availability
  const conflicts = await repo.findConflictingShifts(
    organizationId, data.newStaffId, shift.scheduledStart, shift.scheduledEnd
  );
  if (conflicts.length > 0) {
    throw new ConflictError('New staff member has a conflicting shift');
  }

  return repo.createShiftSwap(data);
}

export async function reviewShiftSwap(organizationId, swapId, data, reviewerId) {
  const swap = await repo.findShiftSwapById(swapId);
  if (!swap) throw new NotFoundError('Shift swap not found');

  if (swap.status !== 'PENDING') {
    throw new BadRequestError(`Cannot review a swap with status ${swap.status}`);
  }

  const updateData = {
    status: data.status,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  };

  const updatedSwap = await repo.updateShiftSwap(swapId, updateData);

  // If approved, update the shift's staff assignment
  if (data.status === 'APPROVED') {
    await repo.updateShift(swap.shiftId, { staffId: swap.newStaffId });
  }

  return updatedSwap;
}

// ============================================================================
// RECURRING PATTERNS
// ============================================================================

export async function listRecurringPatterns(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findRecurringPatterns(organizationId, options);

  return {
    data,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createRecurringPattern(organizationId, data) {
  return repo.createRecurringPattern({
    organizationId,
    ...data,
    effectiveFrom: new Date(data.effectiveFrom),
    ...(data.effectiveTo && { effectiveTo: new Date(data.effectiveTo) }),
  });
}

export async function updateRecurringPattern(organizationId, id, data) {
  const pattern = await repo.findRecurringPatternById(id, organizationId);
  if (!pattern) throw new NotFoundError('Recurring pattern not found');

  const updateData = { ...data };
  if (data.effectiveFrom) updateData.effectiveFrom = new Date(data.effectiveFrom);
  if (data.effectiveTo) updateData.effectiveTo = new Date(data.effectiveTo);

  return repo.updateRecurringPattern(id, updateData);
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export async function listServiceTypes(organizationId, options = {}) {
  const { page = 1, limit = 50 } = options;
  const { data, total } = await repo.findServiceTypes(organizationId, options);

  return {
    data,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function createServiceType(organizationId, data) {
  const existing = await repo.findServiceTypeByCode(organizationId, data.serviceCode);
  if (existing) throw new ConflictError('A service type with this code already exists');

  return repo.createServiceType({ organizationId, ...data });
}

export async function updateServiceType(organizationId, id, data) {
  const serviceType = await repo.findServiceTypeById(id, organizationId);
  if (!serviceType) throw new NotFoundError('Service type not found');

  if (data.serviceCode && data.serviceCode !== serviceType.serviceCode) {
    const existing = await repo.findServiceTypeByCode(organizationId, data.serviceCode);
    if (existing) throw new ConflictError('A service type with this code already exists');
  }

  return repo.updateServiceType(id, data);
}

// ============================================================================
// HELPERS
// ============================================================================

async function ensureShiftExists(organizationId, shiftId) {
  const shift = await repo.findShiftById(shiftId, organizationId);
  if (!shift) throw new NotFoundError('Shift not found');
  return shift;
}

function validateClockSequence(lastAction, newAction) {
  const validTransitions = {
    null: ['CLOCK_IN'],
    undefined: ['CLOCK_IN'],
    CLOCK_IN: ['BREAK_START', 'CLOCK_OUT'],
    BREAK_START: ['BREAK_END'],
    BREAK_END: ['BREAK_START', 'CLOCK_OUT'],
    CLOCK_OUT: ['CLOCK_IN'],
  };

  const allowed = validTransitions[lastAction] || ['CLOCK_IN'];
  if (!allowed.includes(newAction)) {
    throw new BadRequestError(
      `Invalid clock action sequence: cannot ${newAction} after ${lastAction || 'no previous action'}. Expected: ${allowed.join(' or ')}`
    );
  }
}

export default {
  listShifts,
  getShiftById,
  createShift,
  updateShift,
  cancelShift,
  listProgressNotes,
  createProgressNote,
  updateProgressNote,
  listClockEvents,
  recordClockEvent,
  listShiftSwaps,
  createShiftSwap,
  reviewShiftSwap,
  listRecurringPatterns,
  createRecurringPattern,
  updateRecurringPattern,
  listServiceTypes,
  createServiceType,
  updateServiceType,
};

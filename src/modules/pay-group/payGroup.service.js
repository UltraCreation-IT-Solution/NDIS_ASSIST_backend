// src/modules/pay-group/payGroup.service.js

import * as repo from './payGroup.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';

export async function listPayGroups(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAll(organizationId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function getPayGroupById(organizationId, id) {
  const payGroup = await repo.findById(id, organizationId);
  if (!payGroup) {
    throw new NotFoundError('Pay group not found');
  }
  return payGroup;
}

export async function createPayGroup(organizationId, data) {
  // Check for duplicate name
  const existing = await repo.findByName(organizationId, data.name);
  if (existing) {
    throw new ConflictError('A pay group with this name already exists');
  }

  // Validate time boundaries
  validateTimeBoundaries(data);

  // Validate multipliers
  validateMultipliers(data);

  return repo.create({ organizationId, ...data });
}

export async function updatePayGroup(organizationId, id, data) {
  const payGroup = await repo.findById(id, organizationId);
  if (!payGroup) {
    throw new NotFoundError('Pay group not found');
  }

  // Check name uniqueness if name is being changed
  if (data.name && data.name !== payGroup.name) {
    const existing = await repo.findByName(organizationId, data.name);
    if (existing && existing.id !== id) {
      throw new ConflictError('A pay group with this name already exists');
    }
  }

  // Validate time boundaries if any are being updated
  const mergedTimes = {
    dayStartTime: data.dayStartTime || payGroup.dayStartTime,
    eveningStartTime: data.eveningStartTime || payGroup.eveningStartTime,
    nightStartTime: data.nightStartTime || payGroup.nightStartTime,
  };
  validateTimeBoundaries(mergedTimes);

  // Validate multipliers if any are being updated
  validateMultipliers(data);

  return repo.update(id, organizationId, data);
}

export async function deletePayGroup(organizationId, id) {
  const payGroup = await repo.findById(id, organizationId);
  if (!payGroup) {
    throw new NotFoundError('Pay group not found');
  }

  // Check if staff are assigned to this pay group
  if (payGroup._count?.staffMembers > 0) {
    throw new BadRequestError(
      `Cannot deactivate pay group — ${payGroup._count.staffMembers} staff member(s) are currently assigned to it. Reassign them first.`
    );
  }

  return repo.softDelete(id, organizationId);
}

export async function getPayGroupStaff(organizationId, id, options = {}) {
  const { page = 1, limit = 20 } = options;

  const payGroup = await repo.findById(id, organizationId);
  if (!payGroup) {
    throw new NotFoundError('Pay group not found');
  }

  const { data, total } = await repo.findStaffByPayGroup(id, organizationId, options);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

// --- Helpers ---

function validateTimeBoundaries(data) {
  const { dayStartTime, eveningStartTime, nightStartTime } = data;

  if (dayStartTime && eveningStartTime) {
    if (dayStartTime >= eveningStartTime) {
      throw new BadRequestError('Day start time must be before evening start time');
    }
  }

  // nightStartTime is typically "00:00" (midnight) — it wraps around,
  // so we only validate that dayStartTime is after nightStartTime in clock order
  // e.g., night ends at 06:00, day starts at 06:00 — that's the dayStartTime
}

function validateMultipliers(data) {
  const multiplierFields = ['saturdayMultiplier', 'sundayMultiplier', 'holidayMultiplier', 'overtimeMultiplier'];
  for (const field of multiplierFields) {
    if (data[field] !== undefined && data[field] < 1) {
      throw new BadRequestError(`${field} must be at least 1.0`);
    }
  }

  const loadingFields = ['eveningLoadingPct', 'nightLoadingPct', 'earlyMorningLoadingPct'];
  for (const field of loadingFields) {
    if (data[field] !== undefined && data[field] < 0) {
      throw new BadRequestError(`${field} cannot be negative`);
    }
  }
}

export default {
  listPayGroups,
  getPayGroupById,
  createPayGroup,
  updatePayGroup,
  deletePayGroup,
  getPayGroupStaff,
};
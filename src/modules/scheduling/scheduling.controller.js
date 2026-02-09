// src/modules/scheduling/scheduling.controller.js

import * as service from './scheduling.service.js';
import { success, created, paginated } from '../../shared/utils/response.util.js';

// Shifts
export async function listShifts(req, res) {
  const result = await service.listShifts(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Shifts retrieved');
}

export async function getShift(req, res) {
  const shift = await service.getShiftById(req.organizationId, req.params.shiftId);
  return success(res, shift, 'Shift retrieved');
}

export async function createShift(req, res) {
  const shift = await service.createShift(req.organizationId, req.body);
  return created(res, shift, 'Shift created');
}

export async function updateShift(req, res) {
  const shift = await service.updateShift(req.organizationId, req.params.shiftId, req.body);
  return success(res, shift, 'Shift updated');
}

export async function cancelShift(req, res) {
  const shift = await service.cancelShift(req.organizationId, req.params.shiftId, req.body.reason);
  return success(res, shift, 'Shift cancelled');
}

// Progress Notes
export async function listProgressNotes(req, res) {
  const notes = await service.listProgressNotes(req.organizationId, req.params.shiftId);
  return success(res, notes, 'Progress notes retrieved');
}

export async function createProgressNote(req, res) {
  const note = await service.createProgressNote(req.organizationId, req.params.shiftId, req.body);
  return created(res, note, 'Progress note created');
}

export async function updateProgressNote(req, res) {
  const note = await service.updateProgressNote(req.organizationId, req.params.shiftId, req.params.noteId, req.body);
  return success(res, note, 'Progress note updated');
}

// Clock Events
export async function listClockEvents(req, res) {
  const events = await service.listClockEvents(req.organizationId, req.params.shiftId);
  return success(res, events, 'Clock events retrieved');
}

export async function recordClockEvent(req, res) {
  const event = await service.recordClockEvent(req.organizationId, req.params.shiftId, req.body);
  return created(res, event, 'Clock event recorded');
}

// Shift Swaps
export async function listSwaps(req, res) {
  const result = await service.listShiftSwaps(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Shift swaps retrieved');
}

export async function createSwap(req, res) {
  const swap = await service.createShiftSwap(req.organizationId, req.body);
  return created(res, swap, 'Shift swap requested');
}

export async function reviewSwap(req, res) {
  const swap = await service.reviewShiftSwap(req.organizationId, req.params.swapId, req.body, req.userId);
  return success(res, swap, 'Shift swap reviewed');
}

// Recurring Patterns
export async function listRecurring(req, res) {
  const result = await service.listRecurringPatterns(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Recurring patterns retrieved');
}

export async function createRecurring(req, res) {
  const pattern = await service.createRecurringPattern(req.organizationId, req.body);
  return created(res, pattern, 'Recurring pattern created');
}

export async function updateRecurring(req, res) {
  const pattern = await service.updateRecurringPattern(req.organizationId, req.params.id, req.body);
  return success(res, pattern, 'Recurring pattern updated');
}

// Service Types
export async function listServiceTypes(req, res) {
  const result = await service.listServiceTypes(req.organizationId, req.query);
  return paginated(res, result.data, result.pagination, 'Service types retrieved');
}

export async function createServiceType(req, res) {
  const type = await service.createServiceType(req.organizationId, req.body);
  return created(res, type, 'Service type created');
}

export async function updateServiceType(req, res) {
  const type = await service.updateServiceType(req.organizationId, req.params.id, req.body);
  return success(res, type, 'Service type updated');
}

export default {
  listShifts, getShift, createShift, updateShift, cancelShift,
  listProgressNotes, createProgressNote, updateProgressNote,
  listClockEvents, recordClockEvent,
  listSwaps, createSwap, reviewSwap,
  listRecurring, createRecurring, updateRecurring,
  listServiceTypes, createServiceType, updateServiceType,
};

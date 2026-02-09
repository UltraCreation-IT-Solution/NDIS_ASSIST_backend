// src/modules/scheduling/scheduling.routes.js

import { Router } from 'express';
import * as c from './scheduling.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './scheduling.validator.js';

const router = Router();

// --- Shifts ---
router.get('/shifts', authenticate, requirePermission('scheduling:read'), validate(v.listShiftsSchema), c.listShifts);
router.post('/shifts', authenticate, requirePermission('scheduling:write'), validate(v.createShiftSchema), c.createShift);
router.get('/shifts/:shiftId', authenticate, requirePermission('scheduling:read'), validate(v.getShiftSchema), c.getShift);
router.patch('/shifts/:shiftId', authenticate, requirePermission('scheduling:write'), validate(v.updateShiftSchema), c.updateShift);
router.post('/shifts/:shiftId/cancel', authenticate, requirePermission('scheduling:write'), validate(v.cancelShiftSchema), c.cancelShift);

// --- Progress Notes ---
router.get('/shifts/:shiftId/notes', authenticate, requirePermission('scheduling:read'), validate(v.listProgressNotesSchema), c.listProgressNotes);
router.post('/shifts/:shiftId/notes', authenticate, requirePermission('scheduling:write'), validate(v.createProgressNoteSchema), c.createProgressNote);
router.patch('/shifts/:shiftId/notes/:noteId', authenticate, requirePermission('scheduling:write'), validate(v.updateProgressNoteSchema), c.updateProgressNote);

// --- Clock Events ---
router.get('/shifts/:shiftId/clock', authenticate, requirePermission('scheduling:read'), validate(v.listClockEventsSchema), c.listClockEvents);
router.post('/shifts/:shiftId/clock', authenticate, requirePermission('shift:clock'), validate(v.createClockEventSchema), c.recordClockEvent);

// --- Shift Swaps ---
router.get('/swaps', authenticate, requirePermission('scheduling:read'), validate(v.listSwapsSchema), c.listSwaps);
router.post('/swaps', authenticate, requirePermission('scheduling:write'), validate(v.createSwapSchema), c.createSwap);
router.patch('/swaps/:swapId/review', authenticate, requirePermission('scheduling:write'), validate(v.reviewSwapSchema), c.reviewSwap);

// --- Recurring Patterns ---
router.get('/recurring', authenticate, requirePermission('scheduling:read'), validate(v.listRecurringSchema), c.listRecurring);
router.post('/recurring', authenticate, requirePermission('scheduling:write'), validate(v.createRecurringSchema), c.createRecurring);
router.patch('/recurring/:id', authenticate, requirePermission('scheduling:write'), validate(v.updateRecurringSchema), c.updateRecurring);

// --- Service Types ---
router.get('/service-types', authenticate, requirePermission('scheduling:read'), validate(v.listServiceTypesSchema), c.listServiceTypes);
router.post('/service-types', authenticate, requirePermission('scheduling:write'), validate(v.createServiceTypeSchema), c.createServiceType);
router.patch('/service-types/:id', authenticate, requirePermission('scheduling:write'), validate(v.updateServiceTypeSchema), c.updateServiceType);

export default router;

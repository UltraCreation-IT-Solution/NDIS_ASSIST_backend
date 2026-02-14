// src/modules/incident/incident.routes.js

import { Router } from 'express';
import * as c from './incident.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as v from './incident.validator.js';

const router = Router();

// Incidents
router.get('/', authenticate, requirePermission('incidents:read'), validate(v.listIncidentsSchema), c.listIncidents);
router.post('/', authenticate, requirePermission('incidents:write'), validate(v.createIncidentSchema), c.createIncident);

// Complaints
router.get('/complaints', authenticate, requirePermission('incidents:read'), validate(v.listComplaintsSchema), c.listComplaints);
router.post('/complaints', authenticate, requirePermission('incidents:write'), validate(v.createComplaintSchema), c.createComplaint);
router.get('/complaints/:id', authenticate, requirePermission('incidents:read'), validate(v.getComplaintSchema), c.getComplaint);
router.patch('/complaints/:id', authenticate, requirePermission('incidents:write'), validate(v.updateComplaintSchema), c.updateComplaint);

// Incident detail routes (keep after static paths like /complaints)
router.get('/:id', authenticate, requirePermission('incidents:read'), validate(v.getIncidentSchema), c.getIncident);
router.patch('/:id', authenticate, requirePermission('incidents:write'), validate(v.updateIncidentSchema), c.updateIncident);

// Follow-ups (nested under incident)
router.post('/:id/follow-ups', authenticate, requirePermission('incidents:write'), validate(v.createFollowUpSchema), c.createFollowUp);
router.patch('/:id/follow-ups/:followUpId', authenticate, requirePermission('incidents:write'), validate(v.updateFollowUpSchema), c.updateFollowUp);

export default router;

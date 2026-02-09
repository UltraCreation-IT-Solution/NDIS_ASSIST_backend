// src/modules/reports/reports.routes.js

import { Router } from 'express';
import * as c from './reports.controller.js';
import { authenticate, requirePermission } from '../../middleware/auth.midddleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { dateRangeSchema } from './reports.validator.js';

const router = Router();

// Dashboard (accessible to all authenticated users with dashboard:read)
router.get('/dashboard', authenticate, requirePermission('dashboard:read'), c.getDashboardOverview);

// Staff reports
router.get('/staff/summary', authenticate, requirePermission('reports:read'), validate(dateRangeSchema), c.getStaffSummary);
router.get('/staff/compliance', authenticate, requirePermission('reports:read'), c.getStaffCompliance);

// Client reports
router.get('/clients/summary', authenticate, requirePermission('reports:read'), c.getClientSummary);
router.get('/clients/funding', authenticate, requirePermission('reports:read'), c.getClientFunding);

// Financial reports
router.get('/financial/summary', authenticate, requirePermission('reports:read'), validate(dateRangeSchema), c.getFinancialSummary);

// Scheduling reports
router.get('/scheduling/summary', authenticate, requirePermission('reports:read'), validate(dateRangeSchema), c.getSchedulingSummary);

// Incident reports
router.get('/incidents/summary', authenticate, requirePermission('reports:read'), validate(dateRangeSchema), c.getIncidentSummary);

export default router;

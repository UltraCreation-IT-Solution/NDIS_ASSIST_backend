// src/modules/reports/reports.controller.js

import * as service from './reports.service.js';
import { success } from '../../shared/utils/response.util.js';

export async function getDashboardOverview(req, res) {
  const data = await service.getDashboardOverview(req.organizationId);
  return success(res, data, 'Dashboard overview retrieved');
}

export async function getStaffSummary(req, res) {
  const data = await service.getStaffSummary(req.organizationId, req.query);
  return success(res, data, 'Staff summary retrieved');
}

export async function getStaffCompliance(req, res) {
  const data = await service.getStaffComplianceReport(req.organizationId);
  return success(res, data, 'Staff compliance report retrieved');
}

export async function getClientSummary(req, res) {
  const data = await service.getClientSummary(req.organizationId);
  return success(res, data, 'Client summary retrieved');
}

export async function getClientFunding(req, res) {
  const data = await service.getClientFundingReport(req.organizationId);
  return success(res, data, 'Client funding report retrieved');
}

export async function getFinancialSummary(req, res) {
  const data = await service.getFinancialSummary(req.organizationId, req.query);
  return success(res, data, 'Financial summary retrieved');
}

export async function getSchedulingSummary(req, res) {
  const data = await service.getSchedulingSummary(req.organizationId, req.query);
  return success(res, data, 'Scheduling summary retrieved');
}

export async function getIncidentSummary(req, res) {
  const data = await service.getIncidentSummary(req.organizationId, req.query);
  return success(res, data, 'Incident summary retrieved');
}

export default {
  getDashboardOverview, getStaffSummary, getStaffCompliance,
  getClientSummary, getClientFunding,
  getFinancialSummary, getSchedulingSummary, getIncidentSummary,
};

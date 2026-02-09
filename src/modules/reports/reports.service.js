// src/modules/reports/reports.service.js

import * as repo from './reports.repository.js';

export async function getStaffSummary(organizationId, options = {}) {
  return repo.getStaffSummary(organizationId, options);
}

export async function getStaffComplianceReport(organizationId) {
  const data = await repo.getStaffComplianceReport(organizationId);

  const summary = {
    totalStaff: data.length,
    fullyCompliant: data.filter((s) => s.isFullyCompliant).length,
    nonCompliant: data.filter((s) => !s.isFullyCompliant).length,
    expiredChecks: 0,
    expiringSoonChecks: 0,
  };

  for (const staff of data) {
    for (const check of staff.checks) {
      if (check.status === 'EXPIRED') summary.expiredChecks++;
      if (check.status === 'EXPIRING_SOON') summary.expiringSoonChecks++;
    }
  }

  return { summary, staff: data };
}

export async function getClientSummary(organizationId) {
  return repo.getClientSummary(organizationId);
}

export async function getClientFundingReport(organizationId) {
  const data = await repo.getClientFundingReport(organizationId);

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const enriched = data.map((f) => {
    let planStatus = 'ACTIVE';
    if (f.endDate && new Date(f.endDate) <= now) planStatus = 'EXPIRED';
    else if (f.endDate && new Date(f.endDate) <= thirtyDays) planStatus = 'EXPIRING_SOON';

    const utilisation = f.totalBudget > 0
      ? parseFloat(((parseFloat(f.spentAmount) / parseFloat(f.totalBudget)) * 100).toFixed(2))
      : 0;

    return { ...f, planStatus, utilisation };
  });

  return enriched;
}

export async function getFinancialSummary(organizationId, options = {}) {
  return repo.getFinancialSummary(organizationId, options);
}

export async function getSchedulingSummary(organizationId, options = {}) {
  return repo.getSchedulingSummary(organizationId, options);
}

export async function getIncidentSummary(organizationId, options = {}) {
  return repo.getIncidentSummary(organizationId, options);
}

export async function getDashboardOverview(organizationId) {
  const [staff, clients, scheduling, financial, incidents] = await Promise.all([
    repo.getStaffSummary(organizationId, {}),
    repo.getClientSummary(organizationId),
    repo.getSchedulingSummary(organizationId, {}),
    repo.getFinancialSummary(organizationId, {}),
    repo.getIncidentSummary(organizationId, {}),
  ]);

  return {
    staff: { total: staff.totalStaff, byStatus: staff.byStatus },
    clients: { total: clients.totalClients, byStatus: clients.byStatus },
    scheduling: { total: scheduling.totalShifts, byStatus: scheduling.byStatus },
    financial: { totalInvoiced: financial.invoices._sum?.totalAmount || 0, outstanding: financial.invoices.outstanding },
    incidents: { total: incidents.totalIncidents, bySeverity: incidents.bySeverity },
  };
}

export default {
  getStaffSummary, getStaffComplianceReport,
  getClientSummary, getClientFundingReport,
  getFinancialSummary, getSchedulingSummary, getIncidentSummary,
  getDashboardOverview,
};

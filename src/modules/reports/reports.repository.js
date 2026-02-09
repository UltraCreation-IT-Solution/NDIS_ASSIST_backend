// src/modules/reports/reports.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// STAFF REPORTS
// ============================================================================

export async function getStaffSummary(organizationId, options = {}) {
  const { dateFrom, dateTo } = options;

  const [totalStaff, byStatus, byEmploymentType, byDepartment, recentHires] = await Promise.all([
    prisma.staffMember.count({ where: { organizationId } }),
    prisma.staffMember.groupBy({
      by: ['employmentStatus'],
      where: { organizationId },
      _count: true,
    }),
    prisma.staffMember.groupBy({
      by: ['employmentType'],
      where: { organizationId },
      _count: true,
    }),
    prisma.staffMember.groupBy({
      by: ['department'],
      where: { organizationId, department: { not: null } },
      _count: true,
    }),
    prisma.staffMember.findMany({
      where: {
        organizationId,
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      },
      select: { id: true, employeeId: true, position: true, startDate: true, user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return { totalStaff, byStatus, byEmploymentType, byDepartment, recentHires };
}

export async function getStaffComplianceReport(organizationId) {
  const staff = await prisma.staffMember.findMany({
    where: { organizationId, employmentStatus: 'ACTIVE' },
    select: {
      id: true, employeeId: true,
      hasNdisWorkerScreening: true, ndisScreeningExpiry: true,
      hasPoliceCheck: true, policeCheckExpiry: true,
      hasWorkingWithChildren: true, wwcCheckExpiry: true,
      hasFirstAid: true, firstAidExpiry: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return staff.map((s) => {
    const checks = [];
    const addCheck = (name, has, expiry) => {
      let status = 'NOT_PROVIDED';
      if (has && expiry) {
        if (new Date(expiry) <= now) status = 'EXPIRED';
        else if (new Date(expiry) <= thirtyDays) status = 'EXPIRING_SOON';
        else status = 'VALID';
      } else if (has) {
        status = 'VALID';
      }
      checks.push({ name, status, expiryDate: expiry });
    };

    addCheck('NDIS Worker Screening', s.hasNdisWorkerScreening, s.ndisScreeningExpiry);
    addCheck('Police Check', s.hasPoliceCheck, s.policeCheckExpiry);
    addCheck('Working With Children', s.hasWorkingWithChildren, s.wwcCheckExpiry);
    addCheck('First Aid', s.hasFirstAid, s.firstAidExpiry);

    return {
      staffId: s.id,
      employeeId: s.employeeId,
      name: `${s.user.firstName} ${s.user.lastName}`,
      checks,
      isFullyCompliant: checks.every((c) => c.status === 'VALID'),
    };
  });
}

// ============================================================================
// CLIENT REPORTS
// ============================================================================

export async function getClientSummary(organizationId) {
  const [totalClients, byStatus, withNdis, withAgedCare] = await Promise.all([
    prisma.client.count({ where: { organizationId } }),
    prisma.client.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    }),
    prisma.client.count({ where: { organizationId, ndisNumber: { not: null } } }),
    prisma.client.count({ where: { organizationId, hasAgedCare: true } }),
  ]);

  return { totalClients, byStatus, withNdis, withAgedCare };
}

export async function getClientFundingReport(organizationId) {
  return prisma.clientFundingSource.findMany({
    where: { client: { organizationId } },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, ndisNumber: true } },
    },
    orderBy: { endDate: 'asc' },
  });
}

// ============================================================================
// FINANCIAL REPORTS
// ============================================================================

export async function getFinancialSummary(organizationId, options = {}) {
  const { dateFrom, dateTo } = options;

  const dateFilter = {
    ...(dateFrom && { gte: new Date(dateFrom) }),
    ...(dateTo && { lte: new Date(dateTo) }),
  };

  const [invoiceTotals, paymentTotals, invoicesByStatus, revenueByMonth] = await Promise.all([
    prisma.invoice.aggregate({
      where: { organizationId, ...(Object.keys(dateFilter).length && { invoiceDate: dateFilter }) },
      _sum: { totalAmount: true, paidAmount: true, gstAmount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { organizationId, status: 'COMPLETED', ...(Object.keys(dateFilter).length && { paymentDate: dateFilter }) },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where: { organizationId, ...(Object.keys(dateFilter).length && { invoiceDate: dateFilter }) },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // Revenue by month — use Prisma ORM groupBy instead of raw SQL for safety
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { not: 'VOID' },
        ...(Object.keys(dateFilter).length && { invoiceDate: dateFilter }),
      },
      select: { invoiceDate: true, totalAmount: true },
      orderBy: { invoiceDate: 'desc' },
      take: 500,
    }).then((invoices) => {
      const monthMap = {};
      for (const inv of invoices) {
        const key = inv.invoiceDate.toISOString().slice(0, 7); // YYYY-MM
        if (!monthMap[key]) monthMap[key] = { month: key, total: 0, count: 0 };
        monthMap[key].total += parseFloat(inv.totalAmount || 0);
        monthMap[key].count += 1;
      }
      return Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 12);
    }).catch(() => []),
  ]);

  return {
    invoices: { ...invoiceTotals, outstanding: parseFloat(invoiceTotals._sum?.totalAmount || 0) - parseFloat(invoiceTotals._sum?.paidAmount || 0) },
    payments: paymentTotals,
    invoicesByStatus,
    revenueByMonth,
  };
}

// ============================================================================
// SCHEDULING REPORTS
// ============================================================================

export async function getSchedulingSummary(organizationId, options = {}) {
  const { dateFrom, dateTo } = options;

  const dateFilter = {
    ...(dateFrom && { gte: new Date(dateFrom) }),
    ...(dateTo && { lte: new Date(dateTo) }),
  };

  const [totalShifts, byStatus, byStaff, hoursDelivered] = await Promise.all([
    prisma.shift.count({ where: { organizationId, ...(Object.keys(dateFilter).length && { scheduledStart: dateFilter }) } }),
    prisma.shift.groupBy({
      by: ['status'],
      where: { organizationId, ...(Object.keys(dateFilter).length && { scheduledStart: dateFilter }) },
      _count: true,
    }),
    prisma.shift.groupBy({
      by: ['staffId'],
      where: { organizationId, status: 'COMPLETED', ...(Object.keys(dateFilter).length && { scheduledStart: dateFilter }) },
      _sum: { totalHours: true },
      _count: true,
    }),
    prisma.shift.aggregate({
      where: { organizationId, status: 'COMPLETED', ...(Object.keys(dateFilter).length && { scheduledStart: dateFilter }) },
      _sum: { totalHours: true, totalAmount: true },
    }),
  ]);

  return { totalShifts, byStatus, topStaffByShifts: byStaff.slice(0, 10), hoursDelivered };
}

// ============================================================================
// INCIDENT REPORTS
// ============================================================================

export async function getIncidentSummary(organizationId, options = {}) {
  const { dateFrom, dateTo } = options;

  const dateFilter = {
    ...(dateFrom && { gte: new Date(dateFrom) }),
    ...(dateTo && { lte: new Date(dateTo) }),
  };

  const [totalIncidents, bySeverity, byType, byStatus, recentIncidents] = await Promise.all([
    prisma.incident.count({ where: { organizationId, ...(Object.keys(dateFilter).length && { dateOccurred: dateFilter }) } }),
    prisma.incident.groupBy({
      by: ['severity'],
      where: { organizationId, ...(Object.keys(dateFilter).length && { dateOccurred: dateFilter }) },
      _count: true,
    }),
    prisma.incident.groupBy({
      by: ['incidentType'],
      where: { organizationId, ...(Object.keys(dateFilter).length && { dateOccurred: dateFilter }) },
      _count: true,
    }),
    prisma.incident.groupBy({
      by: ['status'],
      where: { organizationId, ...(Object.keys(dateFilter).length && { dateOccurred: dateFilter }) },
      _count: true,
    }),
    prisma.incident.findMany({
      where: { organizationId },
      select: { id: true, incidentNumber: true, incidentType: true, severity: true, status: true, dateOccurred: true },
      orderBy: { dateOccurred: 'desc' },
      take: 10,
    }),
  ]);

  return { totalIncidents, bySeverity, byType, byStatus, recentIncidents };
}

export default {
  getStaffSummary, getStaffComplianceReport,
  getClientSummary, getClientFundingReport,
  getFinancialSummary,
  getSchedulingSummary,
  getIncidentSummary,
};

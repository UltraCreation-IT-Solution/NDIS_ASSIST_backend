// src/modules/billing/billing.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// INVOICES
// ============================================================================

export async function findAllInvoices(organizationId, options = {}) {
  const { page = 1, limit = 20, search, status, clientId, isNdisInvoice, dateFrom, dateTo, sortBy = 'invoiceDate', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(typeof isNdisInvoice === 'boolean' && { isNdisInvoice }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    }),
    ...((dateFrom || dateTo) && {
      invoiceDate: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, ndisNumber: true } },
        _count: { select: { lineItems: true, payments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { data, total };
}

export async function findInvoiceById(id, organizationId) {
  return prisma.invoice.findFirst({
    where: { id, organizationId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, ndisNumber: true, email: true, phone: true } },
      lineItems: { include: { shift: { select: { id: true, scheduledStart: true, scheduledEnd: true } } }, orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { paymentDate: 'desc' } },
      creditNotes: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function findInvoiceByNumber(organizationId, invoiceNumber) {
  return prisma.invoice.findFirst({ where: { organizationId, invoiceNumber } });
}

export async function createInvoice(data) {
  return prisma.invoice.create({
    data,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      lineItems: true,
    },
  });
}

export async function updateInvoice(id, data) {
  return prisma.invoice.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      lineItems: true,
    },
  });
}

export async function getNextInvoiceNumber(organizationId) {
  const last = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  if (!last) return 'INV-000001';
  const num = parseInt(last.invoiceNumber.replace('INV-', ''), 10) || 0;
  return `INV-${String(num + 1).padStart(6, '0')}`;
}

// Line Items
export async function createLineItem(data) {
  return prisma.invoiceLineItem.create({ data });
}

export async function createManyLineItems(items) {
  return prisma.invoiceLineItem.createMany({ data: items });
}

export async function deleteLineItemsByInvoice(invoiceId) {
  return prisma.invoiceLineItem.deleteMany({ where: { invoiceId } });
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function findAllPayments(organizationId, options = {}) {
  const { page = 1, limit = 20, status, clientId, invoiceId, sortBy = 'paymentDate', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(invoiceId && { invoiceId }),
  };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, total };
}

export async function findPaymentById(id, organizationId) {
  return prisma.payment.findFirst({
    where: { id, organizationId },
    include: {
      invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, paidAmount: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function createPayment(data) {
  return prisma.payment.create({ data });
}

export async function updatePayment(id, data) {
  return prisma.payment.update({ where: { id }, data });
}

// ============================================================================
// CREDIT NOTES
// ============================================================================

export async function findAllCreditNotes(organizationId, options = {}) {
  const { page = 1, limit = 20, status, clientId, invoiceId, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const pageNum = Number.parseInt(page, 10) || 1;
  const limitNum = Number.parseInt(limit, 10) || 20;

  const where = {
    organizationId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(invoiceId && { invoiceId }),
  };

  const [data, total] = await Promise.all([
    prisma.creditNote.findMany({
      where,
      include: {
        invoice: { select: { id: true, invoiceNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.creditNote.count({ where }),
  ]);

  return { data, total };
}

export async function findCreditNoteById(id, organizationId) {
  return prisma.creditNote.findFirst({
    where: { id, organizationId },
    include: {
      invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getNextCreditNoteNumber(organizationId) {
  const last = await prisma.creditNote.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: { creditNumber: true },
  });

  if (!last) return 'CN-000001';
  const num = parseInt(last.creditNumber.replace('CN-', ''), 10) || 0;
  return `CN-${String(num + 1).padStart(6, '0')}`;
}

export async function createCreditNote(data) {
  return prisma.creditNote.create({ data });
}

export async function updateCreditNote(id, data) {
  return prisma.creditNote.update({ where: { id }, data });
}

export default {
  findAllInvoices, findInvoiceById, findInvoiceByNumber, createInvoice, updateInvoice, getNextInvoiceNumber,
  createLineItem, createManyLineItems, deleteLineItemsByInvoice,
  findAllPayments, findPaymentById, createPayment, updatePayment,
  findAllCreditNotes, findCreditNoteById, getNextCreditNoteNumber, createCreditNote, updateCreditNote,
};

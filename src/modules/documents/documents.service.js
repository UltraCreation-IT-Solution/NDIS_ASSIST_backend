// src/modules/documents/documents.service.js

import * as repo from './documents.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../shared/errors/AppError.js';

// ============================================================================
// CATEGORIES
// ============================================================================

export async function listCategories(organizationId) {
  return repo.findAllCategories(organizationId);
}

export async function createCategory(organizationId, data) {
  const existing = await repo.findCategoryByName(organizationId, data.name);
  if (existing) throw new ConflictError('A document category with this name already exists');

  return repo.createCategory({ organizationId, ...data });
}

export async function updateCategory(organizationId, id, data) {
  const category = await repo.findCategoryById(id, organizationId);
  if (!category) throw new NotFoundError('Document category not found');

  if (data.name && data.name !== category.name) {
    const existing = await repo.findCategoryByName(organizationId, data.name);
    if (existing) throw new ConflictError('A document category with this name already exists');
  }

  return repo.updateCategory(id, data);
}

export async function deleteCategory(organizationId, id) {
  const category = await repo.findCategoryById(id, organizationId);
  if (!category) throw new NotFoundError('Document category not found');

  if (category._count?.documents > 0) {
    throw new BadRequestError('Cannot delete a category that has documents — move or delete them first');
  }

  return repo.deleteCategory(id);
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function listDocuments(organizationId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const { data, total } = await repo.findAllDocuments(organizationId, options);

  // Enrich with expiry status
  const enriched = data.map(enrichDocumentStatus);

  return { data: enriched, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } };
}

export async function getDocumentById(organizationId, id) {
  const doc = await repo.findDocumentById(id, organizationId);
  if (!doc) throw new NotFoundError('Document not found');
  return enrichDocumentStatus(doc);
}

export async function createDocument(organizationId, data, userId) {
  return repo.createDocument({
    organizationId,
    uploadedById: userId,
    ...data,
    ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
  });
}

export async function updateDocument(organizationId, id, data) {
  const doc = await repo.findDocumentById(id, organizationId);
  if (!doc) throw new NotFoundError('Document not found');

  const updateData = { ...data };
  if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);

  return repo.updateDocument(id, updateData);
}

export async function archiveDocument(organizationId, id) {
  const doc = await repo.findDocumentById(id, organizationId);
  if (!doc) throw new NotFoundError('Document not found');
  return repo.updateDocument(id, { status: 'ARCHIVED' });
}

// ============================================================================
// SIGNATURES
// ============================================================================

export async function listSignatures(organizationId, documentId) {
  const doc = await repo.findDocumentById(documentId, organizationId);
  if (!doc) throw new NotFoundError('Document not found');
  return repo.findSignaturesByDocument(documentId);
}

export async function signDocument(organizationId, documentId, userId, data) {
  const doc = await repo.findDocumentById(documentId, organizationId);
  if (!doc) throw new NotFoundError('Document not found');

  if (!doc.requiresSignature) {
    throw new BadRequestError('This document does not require a signature');
  }

  const existing = await repo.findSignatureByUserAndDoc(documentId, userId);
  if (existing) throw new ConflictError('You have already signed this document');

  return repo.createSignature({
    documentId,
    signedById: userId,
    signatureUrl: data.signatureUrl || null,
    signedAt: new Date(),
    ipAddress: data.ipAddress || null,
  });
}

export async function getPendingSignatures(organizationId, userId) {
  return repo.findPendingSignatures(organizationId, userId);
}

// ============================================================================
// HELPERS
// ============================================================================

function enrichDocumentStatus(doc) {
  if (!doc.expiryDate) return doc;

  const now = new Date();
  const expiry = new Date(doc.expiryDate);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let expiryStatus = 'VALID';
  if (expiry <= now) expiryStatus = 'EXPIRED';
  else if (expiry <= thirtyDaysFromNow) expiryStatus = 'EXPIRING_SOON';

  return { ...doc, expiryStatus };
}

export default {
  listCategories, createCategory, updateCategory, deleteCategory,
  listDocuments, getDocumentById, createDocument, updateDocument, archiveDocument,
  listSignatures, signDocument, getPendingSignatures,
};

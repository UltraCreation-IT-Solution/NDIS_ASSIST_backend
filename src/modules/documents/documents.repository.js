// src/modules/documents/documents.repository.js

import prisma from '../../config/database.js';

// ============================================================================
// DOCUMENT CATEGORIES
// ============================================================================

export async function findAllCategories(organizationId) {
  return prisma.documentCategory.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { documents: true } } },
  });
}

export async function findCategoryById(id, organizationId) {
  return prisma.documentCategory.findFirst({ where: { id, organizationId } });
}

export async function findCategoryByName(organizationId, name) {
  return prisma.documentCategory.findFirst({
    where: { organizationId, name: { equals: name, mode: 'insensitive' } },
  });
}

export async function createCategory(data) {
  return prisma.documentCategory.create({ data });
}

export async function updateCategory(id, data) {
  return prisma.documentCategory.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  return prisma.documentCategory.delete({ where: { id } });
}

// ============================================================================
// ORGANIZATION DOCUMENTS
// ============================================================================

export async function findAllDocuments(organizationId, options = {}) {
  const { page = 1, limit = 20, search, categoryId, status, uploadedById, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where = {
    organizationId,
    ...(categoryId && { categoryId }),
    ...(status && { status }),
    ...(uploadedById && { uploadedById }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.orgDocument.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { signatures: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.orgDocument.count({ where }),
  ]);

  return { data, total };
}

export async function findDocumentById(id, organizationId) {
  return prisma.orgDocument.findFirst({
    where: { id, organizationId },
    include: {
      category: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      signatures: {
        include: { signedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createDocument(data) {
  return prisma.orgDocument.create({ data });
}

export async function updateDocument(id, data) {
  return prisma.orgDocument.update({ where: { id }, data });
}

// ============================================================================
// DOCUMENT SIGNATURES
// ============================================================================

export async function findSignaturesByDocument(documentId) {
  return prisma.documentSignature.findMany({
    where: { documentId },
    include: { signedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findSignatureByUserAndDoc(documentId, userId) {
  return prisma.documentSignature.findFirst({ where: { documentId, signedById: userId } });
}

export async function createSignature(data) {
  return prisma.documentSignature.create({ data });
}

export async function findPendingSignatures(organizationId, userId) {
  return prisma.orgDocument.findMany({
    where: {
      organizationId,
      requiresSignature: true,
      status: 'ACTIVE',
      signatures: { none: { signedById: userId } },
    },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { signatures: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default {
  findAllCategories, findCategoryById, findCategoryByName, createCategory, updateCategory, deleteCategory,
  findAllDocuments, findDocumentById, createDocument, updateDocument,
  findSignaturesByDocument, findSignatureByUserAndDoc, createSignature, findPendingSignatures,
};

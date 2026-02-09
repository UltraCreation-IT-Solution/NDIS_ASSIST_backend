/*
  Warnings:

  - You are about to drop the column `fields` on the `form_templates` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `org_documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,name]` on the table `form_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "complainant_contact" TEXT,
ADD COLUMN     "complainant_name" TEXT,
ADD COLUMN     "desired_outcome" TEXT,
ADD COLUMN     "investigation" TEXT;

-- AlterTable
ALTER TABLE "form_submissions" ADD COLUMN     "staff_id" TEXT;

-- AlterTable
ALTER TABLE "form_templates" DROP COLUMN "fields",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parent_message_id" TEXT;

-- AlterTable
ALTER TABLE "org_documents" DROP COLUMN "category",
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "file_type" TEXT,
ADD COLUMN     "requires_signature" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visible_to_roles" TEXT[];

-- AlterTable
ALTER TABLE "org_settings" ADD COLUMN     "updated_by_id" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "target_roles" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "FormFieldType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "help_text" TEXT,
    "default_value" TEXT,
    "options" TEXT[],
    "validation" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signatures" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signed_by_id" TEXT NOT NULL,
    "signature_url" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_organization_id_idx" ON "announcements"("organization_id");

-- CreateIndex
CREATE INDEX "form_fields_template_id_idx" ON "form_fields"("template_id");

-- CreateIndex
CREATE INDEX "document_categories_organization_id_idx" ON "document_categories"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_organization_id_name_key" ON "document_categories"("organization_id", "name");

-- CreateIndex
CREATE INDEX "document_signatures_document_id_idx" ON "document_signatures"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_signatures_document_id_signed_by_id_key" ON "document_signatures"("document_id", "signed_by_id");

-- CreateIndex
CREATE INDEX "activity_logs_organization_id_idx" ON "activity_logs"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_templates_organization_id_name_key" ON "form_templates"("organization_id", "name");

-- CreateIndex
CREATE INDEX "org_documents_organization_id_status_idx" ON "org_documents"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_filed_by_fkey" FOREIGN KEY ("filed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "form_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_documents" ADD CONSTRAINT "org_documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "document_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_documents" ADD CONSTRAINT "org_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "org_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_signed_by_id_fkey" FOREIGN KEY ("signed_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

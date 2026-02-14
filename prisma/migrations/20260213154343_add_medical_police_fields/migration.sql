-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "medical_attention_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ndis_reportable_incident" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "police_notified" BOOLEAN NOT NULL DEFAULT false;

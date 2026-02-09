-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE_TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlatformInvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ORG_OWNER', 'ADMIN', 'MANAGER', 'SCHEDULER', 'FINANCE', 'COORDINATOR', 'SUPPORT_WORKER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED', 'LOCKED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACT', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'PERSONAL', 'UNPAID', 'PARENTAL', 'WORKERS_COMP', 'COMPASSIONATE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_HOLD', 'DISCHARGED', 'WAITLISTED', 'DECEASED');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('NDIS_AGENCY_MANAGED', 'NDIS_PLAN_MANAGED', 'NDIS_SELF_MANAGED', 'AGED_CARE_HCP', 'AGED_CARE_CHSP', 'PRIVATE', 'INSURANCE', 'DVA');

-- CreateEnum
CREATE TYPE "NdisBudgetCategory" AS ENUM ('CORE_SUPPORTS', 'CAPACITY_BUILDING', 'CAPITAL_SUPPORTS');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CarePlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgedCarePackageLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('INITIAL', 'PERIODIC', 'DISCHARGE', 'FUNCTIONAL', 'RISK', 'BEHAVIORAL');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING_APPROVAL', 'INVOICED');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('WEEKDAY_DAY', 'WEEKDAY_EVENING', 'WEEKDAY_NIGHT', 'SATURDAY', 'SUNDAY', 'PUBLIC_HOLIDAY', 'SLEEPOVER');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClockAction" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END');

-- CreateEnum
CREATE TYPE "ClientMood" AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'UNHAPPY', 'VERY_UNHAPPY', 'ANXIOUS', 'AGITATED', 'NOT_ASSESSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'APPROVED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID', 'EXPORTED_TO_XERO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'DIRECT_DEBIT', 'NDIS_PORTAL', 'BPAY', 'CASH', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "XeroSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'BEHAVIOURAL', 'MEDICATION_ERROR', 'ABUSE_NEGLECT', 'RESTRICTIVE_PRACTICE', 'DEATH', 'SEXUAL_MISCONDUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REPORTED_TO_NDIS');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('SERVICE_QUALITY', 'STAFF_BEHAVIOUR', 'BILLING', 'SCHEDULING', 'COMMUNICATION', 'SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SHIFT_REMINDER', 'SHIFT_CHANGE', 'SHIFT_CANCELLED', 'DOCUMENT_EXPIRY', 'INVOICE_CREATED', 'PAYMENT_RECEIVED', 'LEAVE_UPDATE', 'INCIDENT_REPORTED', 'SOS_ALERT', 'SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'RADIO', 'DATE', 'TIME', 'FILE_UPLOAD', 'SIGNATURE', 'SECTION_HEADER', 'RATING');

-- CreateEnum
CREATE TYPE "FormSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INVOICE', 'PAYMENT', 'TIME_TRACKER', 'VALUATION', 'COMPLIANCE', 'SKILLS', 'ACTION', 'QUALIFICATION', 'AREA_TRACKER', 'LOG', 'KPI', 'DELETED_SHIFT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "PlatformRole" NOT NULL DEFAULT 'SUPER_ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_sessions" (
    "id" TEXT NOT NULL,
    "platform_admin_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "abn" TEXT,
    "ndis_registration_no" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'AU',
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE_TRIAL',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "max_staff" INTEGER,
    "max_clients" INTEGER,
    "price_per_month" DECIMAL(8,2),
    "price_per_user" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "trial_ends_at" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoices" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "status" "PlatformInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "stripe_invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_audit_logs" (
    "id" TEXT NOT NULL,
    "platform_admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "feature_key" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" "OrgRole" NOT NULL DEFAULT 'SUPPORT_WORKER',
    "custom_role_id" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_custom_roles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "token" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "employment_type" "EmploymentType" NOT NULL,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "hourly_rate" DECIMAL(8,2) NOT NULL,
    "pay_group_id" TEXT,
    "has_ndis_worker_screening" BOOLEAN NOT NULL DEFAULT false,
    "ndis_screening_number" TEXT,
    "ndis_screening_expiry" TIMESTAMP(3),
    "has_police_check" BOOLEAN NOT NULL DEFAULT false,
    "police_check_expiry" TIMESTAMP(3),
    "has_working_with_children" BOOLEAN NOT NULL DEFAULT false,
    "wwc_check_expiry" TIMESTAMP(3),
    "has_first_aid" BOOLEAN NOT NULL DEFAULT false,
    "first_aid_expiry" TIMESTAMP(3),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_skills" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency_level" "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certified_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_documents" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "category_id" TEXT,
    "document_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "expiry_date" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_availability" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_leave_requests" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_days" DECIMAL(4,1),
    "reason" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_performance_reviews" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "review_date" TIMESTAMP(3) NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "strengths" TEXT,
    "improvements" TEXT,
    "goals" TEXT,
    "comments" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_training_records" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "training_name" TEXT NOT NULL,
    "provider" TEXT,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "certificate_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leader_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "preferred_name" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "ndis_number" TEXT,
    "ndis_plan_start_date" TIMESTAMP(3),
    "ndis_plan_end_date" TIMESTAMP(3),
    "ndis_plan_manager" TEXT,
    "ndis_plan_manager_email" TEXT,
    "ndis_plan_manager_phone" TEXT,
    "has_aged_care" BOOLEAN NOT NULL DEFAULT false,
    "aged_care_package_level" "AgedCarePackageLevel",
    "aged_care_reference_no" TEXT,
    "client_type_id" TEXT,
    "language_id" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboarded_at" TIMESTAMP(3),
    "discharged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_funding_sources" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "funding_type" "FundingType" NOT NULL,
    "plan_number" TEXT,
    "total_budget" DECIMAL(12,2) NOT NULL,
    "spent_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remaining_amount" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_funding_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_budget_lines" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "funding_source_id" TEXT NOT NULL,
    "category" "NdisBudgetCategory" NOT NULL,
    "support_item_no" TEXT,
    "description" TEXT,
    "allocated_amount" DECIMAL(12,2) NOT NULL,
    "used_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remaining_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_goals" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "goal_title" TEXT NOT NULL,
    "description" TEXT,
    "ndis_domain" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "target_date" TIMESTAMP(3),
    "achieved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_goal_milestones" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "evidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_goal_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_assessments" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL,
    "assessor_name" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "risk_level" "Severity",
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_care_plans" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "CarePlanStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_family_members" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "is_emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_documents" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "category_id" TEXT,
    "document_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "expiry_date" TIMESTAMP(3),
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_notes" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "author_id" TEXT,
    "note_type" TEXT NOT NULL,
    "title" TEXT,
    "note" TEXT NOT NULL,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_service_agreements" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "agreement_number" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "service_details" JSONB,
    "signed_by_client" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMP(3),
    "signature_url" TEXT,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_service_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "service_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "description" TEXT,
    "support_item_no" TEXT,
    "funding_source" TEXT,
    "default_rate" DECIMAL(8,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "service_type_id" TEXT NOT NULL,
    "shift_type_id" TEXT,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "rate_type" "RateType" NOT NULL DEFAULT 'WEEKDAY_DAY',
    "hourly_rate" DECIMAL(8,2),
    "total_hours" DECIMAL(6,2),
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "travel_km" DECIMAL(8,2),
    "total_amount" DECIMAL(10,2),
    "status" "ShiftStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "cancellation_reason" TEXT,
    "is_group_shift" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_shift_patterns" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "recurrence_type" "RecurrenceType" NOT NULL,
    "days_of_week" "DayOfWeek"[],
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_shift_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_progress_notes" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "activities_performed" TEXT NOT NULL,
    "client_mood" "ClientMood",
    "client_response" TEXT,
    "goals_addressed" TEXT,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_details" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_progress_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_swaps" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "original_staff_id" TEXT NOT NULL,
    "new_staff_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" "SwapStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_swaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clock_events" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "action" "ClockAction" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "accuracy" DECIMAL(8,2),
    "address" TEXT,
    "is_within_geofence" BOOLEAN,
    "photo_url" TEXT,
    "device_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clock_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofences" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "radius_meters" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geofences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_location_logs" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "accuracy" DECIMAL(8,2),
    "speed" DECIMAL(6,2),
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "holiday_name" TEXT NOT NULL,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "state" TEXT,
    "is_national" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ndis_price_guide" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "support_item_number" TEXT NOT NULL,
    "support_item_name" TEXT,
    "registration_group" TEXT,
    "support_category" TEXT,
    "unit" TEXT,
    "price_weekday" DECIMAL(8,2) NOT NULL,
    "price_weekday_evening" DECIMAL(8,2),
    "price_weekday_night" DECIMAL(8,2),
    "price_saturday" DECIMAL(8,2),
    "price_sunday" DECIMAL(8,2),
    "price_public_holiday" DECIMAL(8,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ndis_price_guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_groups" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_hourly_rate" DECIMAL(8,2) NOT NULL,
    "saturday_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    "sunday_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 2.0,
    "holiday_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 2.5,
    "evening_loading_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "night_loading_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "early_morning_loading_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "overtime_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    "compound_loadings" BOOLEAN NOT NULL DEFAULT false,
    "day_start_time" TEXT NOT NULL DEFAULT '06:00',
    "evening_start_time" TEXT NOT NULL DEFAULT '20:00',
    "night_start_time" TEXT NOT NULL DEFAULT '00:00',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowance_configs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DECIMAL(8,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowance_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "is_ndis_invoice" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "xero_invoice_id" TEXT,
    "xero_sync_status" "XeroSyncStatus",
    "xero_synced_at" TIMESTAMP(3),
    "xero_sync_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "shift_id" TEXT,
    "support_item_no" TEXT,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "quantity" DECIMAL(8,2) NOT NULL,
    "unit_price" DECIMAL(8,2) NOT NULL,
    "gst_amount" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference_number" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "credit_number" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xero_connections" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "xero_tenant_id" TEXT NOT NULL,
    "xero_tenant_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "scopes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xero_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "incident_number" TEXT NOT NULL,
    "client_id" TEXT,
    "staff_id" TEXT,
    "reported_by" TEXT,
    "incident_type" "IncidentType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "date_occurred" TIMESTAMP(3) NOT NULL,
    "date_reported" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "is_ndis_reportable" BOOLEAN NOT NULL DEFAULT false,
    "ndis_reported_at" TIMESTAMP(3),
    "ndis_reference_no" TEXT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_follow_ups" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "completed_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "complaint_number" TEXT NOT NULL,
    "client_id" TEXT,
    "complaint_type" "ComplaintType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filed_by" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "to_email" TEXT NOT NULL,
    "from_email" TEXT,
    "subject" TEXT NOT NULL,
    "template_id" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "to_phone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'QUEUED',
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_system_form" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "client_id" TEXT,
    "shift_id" TEXT,
    "data" JSONB NOT NULL,
    "status" "FormSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "change_notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metric" TEXT NOT NULL,
    "target_value" DECIMAL(10,2),
    "unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_values" (
    "id" TEXT NOT NULL,
    "kpi_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "actual_value" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reports" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "report_name" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "schedule_frequency" "ScheduleFrequency" NOT NULL,
    "recipient_emails" TEXT[],
    "parameters" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" TEXT NOT NULL,
    "scheduled_report_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'pdf',
    "file_size" INTEGER,
    "generated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "log_level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "stack_trace" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_data_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_data_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_sessions_token_key" ON "platform_sessions"("token");

-- CreateIndex
CREATE INDEX "platform_sessions_token_idx" ON "platform_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_abn_key" ON "organizations"("abn");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_ndis_registration_no_key" ON "organizations"("ndis_registration_no");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_status_idx" ON "organizations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_organization_id_key" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_invoices_invoice_number_key" ON "platform_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "platform_invoices_subscription_id_idx" ON "platform_invoices"("subscription_id");

-- CreateIndex
CREATE INDEX "platform_audit_logs_entity_type_entity_id_idx" ON "platform_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "platform_audit_logs_created_at_idx" ON "platform_audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_organization_id_feature_key_key" ON "feature_flags"("organization_id", "feature_key");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_organization_id_email_key" ON "users"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "org_custom_roles_organization_id_slug_key" ON "org_custom_roles"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_key" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_token_idx" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_organization_id_idx" ON "user_invitations"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_user_id_key" ON "staff_members"("user_id");

-- CreateIndex
CREATE INDEX "staff_members_organization_id_idx" ON "staff_members"("organization_id");

-- CreateIndex
CREATE INDEX "staff_members_employment_status_idx" ON "staff_members"("employment_status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_organization_id_employee_id_key" ON "staff_members"("organization_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_skills_staff_id_skill_name_key" ON "staff_skills"("staff_id", "skill_name");

-- CreateIndex
CREATE INDEX "staff_documents_staff_id_idx" ON "staff_documents"("staff_id");

-- CreateIndex
CREATE INDEX "staff_documents_expiry_date_idx" ON "staff_documents"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_availability_staff_id_day_of_week_key" ON "staff_availability"("staff_id", "day_of_week");

-- CreateIndex
CREATE INDEX "staff_leave_requests_staff_id_idx" ON "staff_leave_requests"("staff_id");

-- CreateIndex
CREATE INDEX "staff_performance_reviews_staff_id_idx" ON "staff_performance_reviews"("staff_id");

-- CreateIndex
CREATE INDEX "staff_training_records_staff_id_idx" ON "staff_training_records"("staff_id");

-- CreateIndex
CREATE INDEX "teams_organization_id_idx" ON "teams"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_staff_id_key" ON "team_members"("team_id", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_user_id_key" ON "clients"("user_id");

-- CreateIndex
CREATE INDEX "clients_organization_id_idx" ON "clients"("organization_id");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE UNIQUE INDEX "clients_organization_id_ndis_number_key" ON "clients"("organization_id", "ndis_number");

-- CreateIndex
CREATE INDEX "client_funding_sources_client_id_idx" ON "client_funding_sources"("client_id");

-- CreateIndex
CREATE INDEX "client_budget_lines_client_id_idx" ON "client_budget_lines"("client_id");

-- CreateIndex
CREATE INDEX "client_goals_client_id_idx" ON "client_goals"("client_id");

-- CreateIndex
CREATE INDEX "client_goal_milestones_goal_id_idx" ON "client_goal_milestones"("goal_id");

-- CreateIndex
CREATE INDEX "client_assessments_client_id_idx" ON "client_assessments"("client_id");

-- CreateIndex
CREATE INDEX "client_care_plans_client_id_idx" ON "client_care_plans"("client_id");

-- CreateIndex
CREATE INDEX "client_family_members_client_id_idx" ON "client_family_members"("client_id");

-- CreateIndex
CREATE INDEX "client_documents_client_id_idx" ON "client_documents"("client_id");

-- CreateIndex
CREATE INDEX "client_notes_client_id_idx" ON "client_notes"("client_id");

-- CreateIndex
CREATE INDEX "client_service_agreements_client_id_idx" ON "client_service_agreements"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_organization_id_service_code_key" ON "service_types"("organization_id", "service_code");

-- CreateIndex
CREATE INDEX "shifts_organization_id_idx" ON "shifts"("organization_id");

-- CreateIndex
CREATE INDEX "shifts_client_id_idx" ON "shifts"("client_id");

-- CreateIndex
CREATE INDEX "shifts_staff_id_idx" ON "shifts"("staff_id");

-- CreateIndex
CREATE INDEX "shifts_scheduled_start_scheduled_end_idx" ON "shifts"("scheduled_start", "scheduled_end");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "recurring_shift_patterns_organization_id_idx" ON "recurring_shift_patterns"("organization_id");

-- CreateIndex
CREATE INDEX "shift_progress_notes_shift_id_idx" ON "shift_progress_notes"("shift_id");

-- CreateIndex
CREATE INDEX "shift_swaps_shift_id_idx" ON "shift_swaps"("shift_id");

-- CreateIndex
CREATE INDEX "clock_events_shift_id_idx" ON "clock_events"("shift_id");

-- CreateIndex
CREATE INDEX "clock_events_staff_id_idx" ON "clock_events"("staff_id");

-- CreateIndex
CREATE INDEX "geofences_organization_id_idx" ON "geofences"("organization_id");

-- CreateIndex
CREATE INDEX "staff_location_logs_staff_id_idx" ON "staff_location_logs"("staff_id");

-- CreateIndex
CREATE INDEX "staff_location_logs_timestamp_idx" ON "staff_location_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "public_holidays_organization_id_holiday_date_state_key" ON "public_holidays"("organization_id", "holiday_date", "state");

-- CreateIndex
CREATE INDEX "ndis_price_guide_support_item_number_idx" ON "ndis_price_guide"("support_item_number");

-- CreateIndex
CREATE INDEX "pay_groups_organization_id_idx" ON "pay_groups"("organization_id");

-- CreateIndex
CREATE INDEX "allowance_configs_organization_id_idx" ON "allowance_configs"("organization_id");

-- CreateIndex
CREATE INDEX "invoices_organization_id_idx" ON "invoices"("organization_id");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_organization_id_invoice_number_key" ON "invoices"("organization_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_organization_id_idx" ON "payments"("organization_id");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_organization_id_credit_number_key" ON "credit_notes"("organization_id", "credit_number");

-- CreateIndex
CREATE UNIQUE INDEX "xero_connections_organization_id_key" ON "xero_connections"("organization_id");

-- CreateIndex
CREATE INDEX "incidents_organization_id_idx" ON "incidents"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_organization_id_incident_number_key" ON "incidents"("organization_id", "incident_number");

-- CreateIndex
CREATE INDEX "incident_follow_ups_incident_id_idx" ON "incident_follow_ups"("incident_id");

-- CreateIndex
CREATE INDEX "complaints_organization_id_idx" ON "complaints"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_organization_id_complaint_number_key" ON "complaints"("organization_id", "complaint_number");

-- CreateIndex
CREATE INDEX "messages_organization_id_idx" ON "messages"("organization_id");

-- CreateIndex
CREATE INDEX "messages_recipient_id_is_read_idx" ON "messages"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "email_logs_organization_id_idx" ON "email_logs"("organization_id");

-- CreateIndex
CREATE INDEX "sms_logs_organization_id_idx" ON "sms_logs"("organization_id");

-- CreateIndex
CREATE INDEX "form_templates_organization_id_idx" ON "form_templates"("organization_id");

-- CreateIndex
CREATE INDEX "form_submissions_template_id_idx" ON "form_submissions"("template_id");

-- CreateIndex
CREATE INDEX "org_documents_organization_id_idx" ON "org_documents"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_document_versions_document_id_version_number_key" ON "org_document_versions"("document_id", "version_number");

-- CreateIndex
CREATE INDEX "kpi_definitions_organization_id_idx" ON "kpi_definitions"("organization_id");

-- CreateIndex
CREATE INDEX "kpi_values_kpi_id_idx" ON "kpi_values"("kpi_id");

-- CreateIndex
CREATE INDEX "scheduled_reports_organization_id_idx" ON "scheduled_reports"("organization_id");

-- CreateIndex
CREATE INDEX "generated_reports_scheduled_report_id_idx" ON "generated_reports"("scheduled_report_id");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "system_logs_log_level_idx" ON "system_logs"("log_level");

-- CreateIndex
CREATE INDEX "system_logs_created_at_idx" ON "system_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "org_settings_organization_id_setting_key_key" ON "org_settings"("organization_id", "setting_key");

-- CreateIndex
CREATE INDEX "master_data_items_organization_id_category_idx" ON "master_data_items"("organization_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "master_data_items_organization_id_category_value_key" ON "master_data_items"("organization_id", "category", "value");

-- AddForeignKey
ALTER TABLE "platform_sessions" ADD CONSTRAINT "platform_sessions_platform_admin_id_fkey" FOREIGN KEY ("platform_admin_id") REFERENCES "platform_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoices" ADD CONSTRAINT "platform_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_platform_admin_id_fkey" FOREIGN KEY ("platform_admin_id") REFERENCES "platform_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "org_custom_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_custom_roles" ADD CONSTRAINT "org_custom_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_pay_group_id_fkey" FOREIGN KEY ("pay_group_id") REFERENCES "pay_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_skills" ADD CONSTRAINT "staff_skills_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_availability" ADD CONSTRAINT "staff_availability_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_leave_requests" ADD CONSTRAINT "staff_leave_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_performance_reviews" ADD CONSTRAINT "staff_performance_reviews_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_training_records" ADD CONSTRAINT "staff_training_records_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_funding_sources" ADD CONSTRAINT "client_funding_sources_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_budget_lines" ADD CONSTRAINT "client_budget_lines_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_budget_lines" ADD CONSTRAINT "client_budget_lines_funding_source_id_fkey" FOREIGN KEY ("funding_source_id") REFERENCES "client_funding_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_goals" ADD CONSTRAINT "client_goals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_goal_milestones" ADD CONSTRAINT "client_goal_milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "client_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_assessments" ADD CONSTRAINT "client_assessments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_care_plans" ADD CONSTRAINT "client_care_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_family_members" ADD CONSTRAINT "client_family_members_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_family_members" ADD CONSTRAINT "client_family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_service_agreements" ADD CONSTRAINT "client_service_agreements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_shift_patterns" ADD CONSTRAINT "recurring_shift_patterns_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_shift_patterns" ADD CONSTRAINT "recurring_shift_patterns_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_shift_patterns" ADD CONSTRAINT "recurring_shift_patterns_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_progress_notes" ADD CONSTRAINT "shift_progress_notes_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_original_staff_id_fkey" FOREIGN KEY ("original_staff_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_new_staff_id_fkey" FOREIGN KEY ("new_staff_id") REFERENCES "staff_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_events" ADD CONSTRAINT "clock_events_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clock_events" ADD CONSTRAINT "clock_events_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofences" ADD CONSTRAINT "geofences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_location_logs" ADD CONSTRAINT "staff_location_logs_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_holidays" ADD CONSTRAINT "public_holidays_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ndis_price_guide" ADD CONSTRAINT "ndis_price_guide_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_groups" ADD CONSTRAINT "pay_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allowance_configs" ADD CONSTRAINT "allowance_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xero_connections" ADD CONSTRAINT "xero_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_follow_ups" ADD CONSTRAINT "incident_follow_ups_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "form_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_documents" ADD CONSTRAINT "org_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_document_versions" ADD CONSTRAINT "org_document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "org_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_values" ADD CONSTRAINT "kpi_values_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_values" ADD CONSTRAINT "kpi_values_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_reports" ADD CONSTRAINT "scheduled_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_scheduled_report_id_fkey" FOREIGN KEY ("scheduled_report_id") REFERENCES "scheduled_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_settings" ADD CONSTRAINT "org_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_data_items" ADD CONSTRAINT "master_data_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

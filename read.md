# ndassist Backend Development Plan

## Tech Stack: Node.js + Express.js + Prisma + PostgreSQL (JavaScript)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Design](#2-architecture-design)
3. [Project Structure](#3-project-structure)
4. [Development Phases](#4-development-phases)
5. [Database Strategy](#5-database-strategy)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Multi-Tenancy Implementation](#7-multi-tenancy-implementation)
8. [API Design](#8-api-design)
9. [Security Implementation](#9-security-implementation)
10. [External Integrations](#10-external-integrations)
11. [Testing Strategy](#11-testing-strategy)
12. [DevOps & Deployment](#12-devops--deployment)
13. [Performance Optimization](#13-performance-optimization)
14. [Monitoring & Logging](#14-monitoring--logging)
15. [Timeline Estimate](#15-timeline-estimate)

---

## 1. Project Overview

### 1.1 System Summary
| Aspect | Details |
|--------|---------|
| Platform | Multi-tenant SaaS for NDIS Provider Management |
| Scale | 69 database models, 47 enums, 12 domains |
| Users | Platform Admins, Org Admins, Staff, Limited Client Access |
| Key Features | Staff management, client care, scheduling, billing, incidents, compliance |

### 1.2 Technical Requirements
- RESTful API with JSON responses
- JWT-based authentication with refresh tokens
- Row-level security via organization scoping
- Real-time notifications (WebSocket/SSE)
- File uploads (S3-compatible storage)
- Background job processing
- Audit logging for NDIS compliance

### 1.3 Non-Functional Requirements
- Response time < 200ms for 95th percentile
- Support 100+ concurrent users per organization
- 99.9% uptime SLA
- GDPR/Australian Privacy Act compliant
- Daily automated backups

---

## 2. Architecture Design

### 2.1 Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│            (Web App, Mobile App, External APIs)             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                    API GATEWAY LAYER                        │
│         (Rate Limiting, Auth Check, Request Logging)        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   CONTROLLER LAYER                          │
│        (Route Handlers, Request Parsing, Response)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    SERVICE LAYER                            │
│         (Business Logic, Validation, Orchestration)         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│              (Data Access, Prisma Queries)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   DATABASE LAYER                            │
│                    (PostgreSQL)                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Supporting Infrastructure

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Redis     │  │   BullMQ     │  │   AWS S3     │  │  Socket.io   │
│  (Sessions   │  │   (Job       │  │  (File       │  │  (Real-time  │
│   + Cache)   │  │   Queue)     │  │   Storage)   │  │   Events)    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Express Server         │
                    │    (Node.js Runtime)        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Prisma ORM             │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       PostgreSQL            │
                    └─────────────────────────────┘
```

### 2.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma | Type-safe queries, migrations, excellent DX |
| Auth | JWT + Refresh Tokens | Stateless, scalable, mobile-friendly |
| Job Queue | BullMQ | Redis-backed, reliable, good monitoring |
| File Storage | S3-compatible | Scalable, CDN-ready, cost-effective |
| Real-time | Socket.io | Fallback support, room-based, mature |
| Validation | Joi | Comprehensive, readable schemas |
| Logging | Pino | Fast, JSON output, low overhead |

---

## 3. Project Structure

```
ndassist-backend/
│
├── prisma/
│   ├── schema.prisma              # Complete database schema
│   ├── migrations/                # Auto-generated migrations
│   └── seed/
│       ├── index.js               # Seed orchestrator
│       ├── platform.seed.js       # Platform admin data
│       ├── masterData.seed.js     # NDIS price guide, enums
│       └── demo.seed.js           # Demo organization
│
├── src/
│   ├── app.js                     # Express app configuration
│   ├── server.js                  # Entry point, server startup
│   │
│   ├── config/
│   │   ├── index.js               # Config aggregator & validation
│   │   ├── database.js            # Prisma client singleton
│   │   ├── redis.js               # Redis client setup
│   │   ├── storage.js             # S3 client configuration
│   │   ├── mail.js                # Email transporter setup
│   │   └── constants.js           # App-wide constants
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js            # JWT verification
│   │   ├── platformAuth.middleware.js    # Super admin auth
│   │   ├── rbac.middleware.js            # Permission checking
│   │   ├── tenant.middleware.js          # Org context injection
│   │   ├── validate.middleware.js        # Joi validation
│   │   ├── rateLimiter.middleware.js     # Rate limiting
│   │   ├── upload.middleware.js          # Multer + S3
│   │   ├── audit.middleware.js           # Audit log capture
│   │   ├── requestId.middleware.js       # Request tracing
│   │   └── error.middleware.js           # Global error handler
│   │
│   ├── modules/
│   │   │
│   │   ├── platform/                     # ════ SUPER ADMIN ══════
│   │   │   ├── platform.routes.js
│   │   │   ├── platform.controller.js
│   │   │   ├── platform.service.js
│   │   │   ├── platform.repository.js
│   │   │   └── platform.validator.js
│   │   │
│   │   ├── auth/                         # ══════ AUTH ═══════════
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.validator.js
│   │   │   └── token.service.js          # JWT utilities
│   │   │
│   │   ├── organization/                 # ══════ ORG MGMT ═══════
│   │   │   ├── organization.routes.js
│   │   │   ├── organization.controller.js
│   │   │   ├── organization.service.js
│   │   │   ├── organization.repository.js
│   │   │   ├── organization.validator.js
│   │   │   ├── settings.service.js       # Org settings
│   │   │   └── subscription.service.js   # Billing/plans
│   │   │
│   │   ├── user/                         # ══════ USERS ══════════
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.validator.js
│   │   │   ├── invitation.service.js     # User invites
│   │   │   └── role.service.js           # Custom roles
│   │   │
│   │   ├── staff/                        # ══════ STAFF ══════════
│   │   │   ├── staff.routes.js
│   │   │   ├── staff.controller.js
│   │   │   ├── staff.service.js
│   │   │   ├── staff.repository.js
│   │   │   ├── staff.validator.js
│   │   │   ├── availability.service.js   # Staff availability
│   │   │   ├── leave.service.js          # Leave requests
│   │   │   ├── document.service.js       # Staff documents
│   │   │   ├── training.service.js       # Training records
│   │   │   └── team.service.js           # Team management
│   │   │
│   │   ├── client/                       # ══════ CLIENTS ════════
│   │   │   ├── client.routes.js
│   │   │   ├── client.controller.js
│   │   │   ├── client.service.js
│   │   │   ├── client.repository.js
│   │   │   ├── client.validator.js
│   │   │   ├── funding.service.js        # NDIS funding
│   │   │   ├── goal.service.js           # Goals & milestones
│   │   │   ├── carePlan.service.js       # Care plans
│   │   │   ├── assessment.service.js     # Assessments
│   │   │   └── agreement.service.js      # Service agreements
│   │   │
│   │   ├── scheduling/                   # ══════ SCHEDULING ═════
│   │   │   ├── scheduling.routes.js
│   │   │   ├── scheduling.controller.js
│   │   │   ├── scheduling.service.js
│   │   │   ├── scheduling.repository.js
│   │   │   ├── scheduling.validator.js
│   │   │   ├── shift.service.js          # Shift CRUD
│   │   │   ├── clock.service.js          # Clock in/out
│   │   │   ├── geofence.service.js       # GPS verification
│   │   │   ├── recurring.service.js      # Recurring shifts
│   │   │   ├── swap.service.js           # Shift swaps
│   │   │   └── holiday.service.js        # Public holidays
│   │   │
│   │   ├── billing/                      # ══════ BILLING ════════
│   │   │   ├── billing.routes.js
│   │   │   ├── billing.controller.js
│   │   │   ├── billing.service.js
│   │   │   ├── billing.repository.js
│   │   │   ├── billing.validator.js
│   │   │   ├── invoice.service.js        # Invoice generation
│   │   │   ├── payment.service.js        # Payment tracking
│   │   │   ├── creditNote.service.js     # Credit notes
│   │   │   ├── priceGuide.service.js     # NDIS price guide
│   │   │   ├── payroll.service.js        # Payroll processing
│   │   │   └── xero/
│   │   │       ├── xero.service.js       # Xero integration
│   │   │       ├── xero.auth.js          # OAuth handling
│   │   │       └── xero.sync.js          # Data sync
│   │   │
│   │   ├── incident/                     # ══════ INCIDENTS ══════
│   │   │   ├── incident.routes.js
│   │   │   ├── incident.controller.js
│   │   │   ├── incident.service.js
│   │   │   ├── incident.repository.js
│   │   │   ├── incident.validator.js
│   │   │   ├── followUp.service.js       # Follow-up actions
│   │   │   └── complaint.service.js      # Complaints
│   │   │
│   │   ├── communication/                # ══════ COMMS ══════════
│   │   │   ├── communication.routes.js
│   │   │   ├── communication.controller.js
│   │   │   ├── communication.service.js
│   │   │   ├── communication.repository.js
│   │   │   ├── message.service.js        # Internal messaging
│   │   │   ├── notification.service.js   # Push notifications
│   │   │   └── providers/
│   │   │       ├── email.provider.js     # SendGrid/SES
│   │   │       ├── sms.provider.js       # Twilio/MessageMedia
│   │   │       └── push.provider.js      # FCM
│   │   │
│   │   ├── forms/                        # ══════ FORMS ══════════
│   │   │   ├── forms.routes.js
│   │   │   ├── forms.controller.js
│   │   │   ├── forms.service.js
│   │   │   ├── forms.repository.js
│   │   │   ├── forms.validator.js
│   │   │   └── formBuilder.service.js    # Dynamic form logic
│   │   │
│   │   ├── documents/                    # ══════ DOCUMENTS ══════
│   │   │   ├── documents.routes.js
│   │   │   ├── documents.controller.js
│   │   │   ├── documents.service.js
│   │   │   ├── documents.repository.js
│   │   │   ├── documents.validator.js
│   │   │   └── version.service.js        # Document versioning
│   │   │
│   │   ├── reports/                      # ══════ REPORTS ════════
│   │   │   ├── reports.routes.js
│   │   │   ├── reports.controller.js
│   │   │   ├── reports.service.js
│   │   │   ├── reports.repository.js
│   │   │   ├── kpi.service.js            # KPI calculations
│   │   │   ├── scheduled.service.js      # Scheduled reports
│   │   │   └── generators/
│   │   │       ├── pdf.generator.js      # PDF reports
│   │   │       ├── excel.generator.js    # Excel exports
│   │   │       └── csv.generator.js      # CSV exports
│   │   │
│   │   └── system/                       # ══════ SYSTEM ═════════
│   │       ├── system.routes.js
│   │       ├── system.controller.js
│   │       ├── system.service.js
│   │       ├── audit.service.js          # Audit logs
│   │       ├── activity.service.js       # Activity logs
│   │       └── masterData.service.js     # Master data CRUD
│   │
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── response.util.js          # Standardized responses
│   │   │   ├── pagination.util.js        # Pagination helpers
│   │   │   ├── crypto.util.js            # Hashing, encryption
│   │   │   ├── date.util.js              # Date helpers (dayjs)
│   │   │   ├── slug.util.js              # Slug generation
│   │   │   ├── fileUpload.util.js        # Upload helpers
│   │   │   └── ndis.util.js              # NDIS-specific helpers
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.js               # Base error class
│   │   │   ├── ValidationError.js
│   │   │   ├── AuthenticationError.js
│   │   │   ├── AuthorizationError.js
│   │   │   ├── NotFoundError.js
│   │   │   ├── ConflictError.js
│   │   │   └── RateLimitError.js
│   │   │
│   │   └── constants/
│   │       ├── permissions.js            # All permissions
│   │       ├── roles.js                  # Default roles
│   │       ├── ndis.constants.js         # NDIS codes, categories
│   │       └── httpStatus.js             # HTTP status codes
│   │
│   ├── jobs/
│   │   ├── index.js                      # Job queue setup
│   │   ├── queues.js                     # Queue definitions
│   │   ├── workers/
│   │   │   ├── email.worker.js           # Email sending
│   │   │   ├── sms.worker.js             # SMS sending
│   │   │   ├── push.worker.js            # Push notifications
│   │   │   ├── invoice.worker.js         # Invoice generation
│   │   │   ├── report.worker.js          # Report generation
│   │   │   ├── xeroSync.worker.js        # Xero sync
│   │   │   └── cleanup.worker.js         # Data cleanup
│   │   └── schedulers/
│   │       ├── shiftReminder.scheduler.js
│   │       ├── reportGeneration.scheduler.js
│   │       ├── documentExpiry.scheduler.js
│   │       └── dataRetention.scheduler.js
│   │
│   └── websocket/
│       ├── index.js                      # Socket.io setup
│       ├── auth.js                       # Socket authentication
│       ├── rooms.js                      # Room management
│       └── handlers/
│           ├── notification.handler.js
│           ├── message.handler.js
│           └── presence.handler.js
│
├── tests/
│   ├── setup.js                          # Test configuration
│   ├── fixtures/                         # Test data
│   ├── helpers/                          # Test utilities
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   └── e2e/                              # End-to-end tests
│
├── scripts/
│   ├── migrate.js                        # Migration runner
│   ├── seed.js                           # Seed runner
│   ├── generatePriceGuide.js             # Import NDIS prices
│   └── healthCheck.js                    # Health check script
│
├── docs/
│   ├── API.md                            # API documentation
│   ├── DEPLOYMENT.md                     # Deployment guide
│   └── postman/                          # Postman collection
│
├── .env.example                          # Environment template
├── .eslintrc.js                          # ESLint config
├── .prettierrc                           # Prettier config
├── docker-compose.yml                    # Local development
├── Dockerfile                            # Production image
├── package.json
└── README.md
```

---

## 4. Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Project setup, core infrastructure, authentication

```
Week 1:
├── Day 1-2: Project initialization
│   ├── Initialize Node.js project with ESM modules
│   ├── Install core dependencies
│   ├── Set up ESLint, Prettier, Husky
│   ├── Configure environment variables
│   └── Set up Docker Compose for local dev
│
├── Day 3-4: Database setup
│   ├── Initialize Prisma
│   ├── Copy schema.prisma (already complete)
│   ├── Run initial migration
│   ├── Set up Prisma client singleton
│   └── Create base repository pattern
│
└── Day 5: Express app structure
    ├── Set up Express with middleware
    ├── Configure error handling
    ├── Set up request logging (Pino)
    ├── Create standardized response utilities
    └── Health check endpoint

Week 2:
├── Day 1-3: Authentication module
│   ├── JWT token generation/verification
│   ├── Refresh token rotation
│   ├── Login/Logout endpoints
│   ├── Password reset flow
│   └── Session management
│
├── Day 4-5: Platform admin module
│   ├── Platform admin authentication
│   ├── Organization CRUD
│   ├── Subscription management
│   └── Platform dashboard stats
```

### Phase 2: Core Modules (Week 3-5)
**Goal**: User management, organization setup, staff management

```
Week 3:
├── User & RBAC module
│   ├── User CRUD operations
│   ├── Role assignment
│   ├── Custom role creation
│   ├── Permission middleware
│   └── User invitation system
│
└── Organization module
    ├── Organization settings
    ├── Feature flag management
    ├── Branding settings
    └── Audit log setup

Week 4:
├── Staff management module
│   ├── Staff member CRUD
│   ├── Staff documents & expiry tracking
│   ├── Skills management
│   ├── Availability management
│   └── Leave request workflow
│
└── Team management
    ├── Team CRUD
    ├── Team member assignment
    └── Team-based filtering

Week 5:
├── Client management module
│   ├── Client CRUD
│   ├── Client documents
│   ├── Family member contacts
│   ├── Client notes
│   └── Search & filtering
│
└── Funding & care
    ├── NDIS funding sources
    ├── Budget lines & tracking
    ├── Goals & milestones
    ├── Care plans
    └── Service agreements
```

### Phase 3: Operations (Week 6-8)
**Goal**: Scheduling, clock events, geofencing, incidents

```
Week 6:
├── Scheduling module (Part 1)
│   ├── Service types CRUD
│   ├── Shift CRUD
│   ├── Shift assignment
│   ├── Calendar views (day/week/month)
│   └── Conflict detection
│
└── Scheduling module (Part 2)
    ├── Recurring shift patterns
    ├── Shift templates
    ├── Shift swap requests
    └── Public holiday handling

Week 7:
├── Clock events & GPS
│   ├── Clock in/out endpoints
│   ├── Geofence CRUD
│   ├── GPS location logging
│   ├── Geofence validation
│   └── Progress notes
│
└── Mobile API optimizations
    ├── Offline-first considerations
    ├── Batch sync endpoints
    └── Push notification triggers

Week 8:
├── Incident management
│   ├── Incident CRUD
│   ├── Incident categories & severity
│   ├── Follow-up actions
│   ├── Escalation rules
│   └── Incident reports
│
└── Complaints module
    ├── Complaint CRUD
    ├── Resolution tracking
    └── Compliance reporting
```

### Phase 4: Billing & Integrations (Week 9-11)
**Goal**: Invoicing, payments, Xero integration

```
Week 9:
├── Billing setup
│   ├── NDIS price guide import
│   ├── Service rate configuration
│   ├── Pay groups & allowances
│   └── Rate calculations
│
└── Invoice generation
    ├── Invoice CRUD
    ├── Auto-generate from shifts
    ├── Line item management
    ├── Invoice PDF generation
    └── Bulk invoicing

Week 10:
├── Payments & credits
│   ├── Payment recording
│   ├── Payment allocation
│   ├── Credit notes
│   ├── Statement generation
│   └── Aging reports
│
└── Payroll
    ├── Timesheet calculations
    ├── Allowance calculations
    ├── Payroll exports
    └── Payroll reports

Week 11:
├── Xero integration
│   ├── OAuth 2.0 connection flow
│   ├── Contact sync
│   ├── Invoice sync
│   ├── Payment sync
│   └── Disconnect handling
│
└── External integrations prep
    ├── NDIS portal API research
    ├── Webhook infrastructure
    └── API rate limiting
```

### Phase 5: Communication & Reports (Week 12-13)
**Goal**: Messaging, notifications, reporting

```
Week 12:
├── Communication module
│   ├── Internal messaging
│   ├── Email sending (templates)
│   ├── SMS sending
│   ├── Push notifications
│   └── Communication logs
│
└── Notification system
    ├── Notification preferences
    ├── In-app notifications
    ├── WebSocket real-time updates
    └── Notification batching

Week 13:
├── Forms module
│   ├── Form template builder
│   ├── Form rendering logic
│   ├── Form submissions
│   └── Form data exports
│
└── Reports & KPIs
    ├── KPI definitions
    ├── KPI calculations
    ├── Scheduled reports
    ├── Report generation (PDF/Excel)
    └── Dashboard widgets
```

### Phase 6: Polish & Launch (Week 14-16)
**Goal**: Testing, optimization, deployment

```
Week 14:
├── Comprehensive testing
│   ├── Unit test completion
│   ├── Integration tests
│   ├── E2E critical paths
│   └── Load testing
│
└── Security audit
    ├── Penetration testing
    ├── Dependency audit
    ├── OWASP compliance check
    └── Data encryption review

Week 15:
├── Performance optimization
│   ├── Query optimization
│   ├── Caching implementation
│   ├── Database indexing
│   └── Response time optimization
│
└── Documentation
    ├── API documentation (OpenAPI)
    ├── Postman collection
    ├── Deployment guide
    └── Developer onboarding

Week 16:
├── Deployment preparation
│   ├── CI/CD pipeline
│   ├── Staging environment
│   ├── Production environment
│   └── Monitoring setup
│
└── Launch
    ├── Final QA
    ├── Data migration (if any)
    ├── Go-live
    └── Post-launch monitoring
```

---

## 5. Database Strategy

### 5.1 Prisma Configuration

```javascript
// prisma/schema.prisma - Generator configuration
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, postgis]  // For UUID and geospatial
}
```

### 5.2 Migration Strategy

```bash
# Development workflow
npx prisma migrate dev --name descriptive_name

# Production workflow
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset
```

**Migration naming convention:**
```
YYYYMMDD_HHMMSS_description
Examples:
- 20240115_143022_add_staff_training_records
- 20240120_091500_add_geofence_polygon_support
```

### 5.3 Seed Strategy

```javascript
// prisma/seed/index.js
const { PrismaClient } = require('@prisma/client');
const seedPlatform = require('./platform.seed');
const seedMasterData = require('./masterData.seed');
const seedDemo = require('./demo.seed');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Order matters - dependencies first
  await seedPlatform(prisma);      // Platform admins
  await seedMasterData(prisma);    // NDIS price guide, categories
  
  if (process.env.NODE_ENV !== 'production') {
    await seedDemo(prisma);        // Demo organization & data
  }
  
  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 5.4 Database Indexing Strategy

```prisma
// Key indexes for performance (add to schema)

model Shift {
  // ... fields ...
  
  @@index([organizationId, startTime])      // Calendar queries
  @@index([staffMemberId, startTime])       // Staff schedule
  @@index([clientId, startTime])            // Client schedule
  @@index([status, startTime])              // Status filtering
}

model Invoice {
  // ... fields ...
  
  @@index([organizationId, createdAt])      // Invoice listing
  @@index([clientId, status])               // Client invoices
  @@index([dueDate, status])                // Overdue queries
}

model AuditLog {
  // ... fields ...
  
  @@index([organizationId, createdAt])      // Audit queries
  @@index([entityType, entityId])           // Entity history
  @@index([userId, createdAt])              // User activity
}
```

### 5.5 Connection Pooling

```javascript
// src/config/database.js
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error', 'warn'],
  });
} else {
  // Prevent multiple instances in development
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOWS                        │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN FLOW
┌────────┐     POST /auth/login      ┌────────┐
│ Client │ ───────────────────────── │ Server │
│        │  {email, password}        │        │
│        │                           │        │
│        │ ◄─────────────────────────│        │
│        │  {accessToken,            │        │
│        │   refreshToken,           │        │
│        │   user}                   │        │
└────────┘                           └────────┘

2. AUTHENTICATED REQUEST
┌────────┐    Authorization: Bearer   ┌────────┐
│ Client │ ────────────────────────── │ Server │
│        │    {accessToken}           │        │
│        │                            │        │
│        │    Verify JWT ────────────►│        │
│        │    Extract user ──────────►│        │
│        │    Check permissions ─────►│        │
│        │                            │        │
│        │ ◄──────────────────────────│        │
│        │    {response}              │        │
└────────┘                            └────────┘

3. TOKEN REFRESH
┌────────┐   POST /auth/refresh       ┌────────┐
│ Client │ ────────────────────────── │ Server │
│        │   {refreshToken}           │        │
│        │                            │        │
│        │   Validate refresh token ─►│        │
│        │   Rotate token ───────────►│        │
│        │                            │        │
│        │ ◄──────────────────────────│        │
│        │   {newAccessToken,         │        │
│        │    newRefreshToken}        │        │
└────────┘                            └────────┘
```

### 6.2 JWT Token Structure

```javascript
// Access Token Payload (short-lived: 15 minutes)
{
  sub: "user-uuid",
  email: "user@example.com",
  organizationId: "org-uuid",
  role: "ADMIN",
  permissions: ["staff:read", "staff:write", "client:read"],
  type: "access",
  iat: 1704067200,
  exp: 1704068100
}

// Refresh Token Payload (long-lived: 7 days)
{
  sub: "user-uuid",
  sessionId: "session-uuid",
  type: "refresh",
  iat: 1704067200,
  exp: 1704672000
}
```

### 6.3 Token Service Implementation

```javascript
// src/modules/auth/token.service.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config');
const prisma = require('../../config/database');

class TokenService {
  generateAccessToken(user, organization) {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: organization.id,
      role: user.role,
      permissions: this.getPermissions(user.role, user.customRole),
      type: 'access',
    };

    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn, // 15m
      issuer: 'ndassist',
    });
  }

  generateRefreshToken(user, sessionId) {
    const payload = {
      sub: user.id,
      sessionId,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn, // 7d
      issuer: 'ndassist',
    });
  }

  async createSession(userId, userAgent, ipAddress) {
    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    return session;
  }

  verifyAccessToken(token) {
    return jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'ndassist',
    });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'ndassist',
    });
  }

  getPermissions(role, customRole) {
    // If custom role exists, use its permissions
    if (customRole?.permissions) {
      return customRole.permissions;
    }
    
    // Default role permissions
    const rolePermissions = {
      OWNER: ['*'], // All permissions
      ADMIN: ['staff:*', 'client:*', 'scheduling:*', 'billing:read', 'reports:*'],
      MANAGER: ['staff:read', 'client:*', 'scheduling:*', 'reports:read'],
      STAFF: ['client:read', 'scheduling:read', 'shift:clock'],
      VIEWER: ['dashboard:read'],
    };

    return rolePermissions[role] || [];
  }
}

module.exports = new TokenService();
```

### 6.4 Auth Middleware

```javascript
// src/middleware/auth.middleware.js
const tokenService = require('../modules/auth/token.service');
const prisma = require('../config/database');
const { AuthenticationError } = require('../shared/errors');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);

    // Verify session is still valid
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new AuthenticationError('Session expired or revoked');
    }

    // Attach user context to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      organizationId: decoded.organizationId,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    next(error);
  }
};

module.exports = authMiddleware;
```

### 6.5 RBAC Middleware

```javascript
// src/middleware/rbac.middleware.js
const { AuthorizationError } = require('../shared/errors');

/**
 * Check if user has required permission
 * @param {string} requiredPermission - Permission to check (e.g., 'staff:write')
 */
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    const { permissions } = req.user;

    // Super admin has all permissions
    if (permissions.includes('*')) {
      return next();
    }

    // Check for exact match
    if (permissions.includes(requiredPermission)) {
      return next();
    }

    // Check for wildcard match (e.g., 'staff:*' matches 'staff:write')
    const [resource, action] = requiredPermission.split(':');
    if (permissions.includes(`${resource}:*`)) {
      return next();
    }

    throw new AuthorizationError(
      `Missing required permission: ${requiredPermission}`
    );
  };
};

/**
 * Check if user has any of the required permissions
 */
const requireAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { permissions } = req.user;

    if (permissions.includes('*')) {
      return next();
    }

    const hasPermission = requiredPermissions.some((required) => {
      if (permissions.includes(required)) return true;
      const [resource] = required.split(':');
      return permissions.includes(`${resource}:*`);
    });

    if (hasPermission) {
      return next();
    }

    throw new AuthorizationError('Insufficient permissions');
  };
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(`Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireRole,
};
```

### 6.6 Permission Definitions

```javascript
// src/shared/constants/permissions.js

const PERMISSIONS = {
  // Dashboard
  DASHBOARD_READ: 'dashboard:read',

  // Staff Management
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  STAFF_DELETE: 'staff:delete',
  STAFF_DOCUMENTS: 'staff:documents',
  STAFF_LEAVE_APPROVE: 'staff:leave:approve',

  // Client Management
  CLIENT_READ: 'client:read',
  CLIENT_WRITE: 'client:write',
  CLIENT_DELETE: 'client:delete',
  CLIENT_SENSITIVE: 'client:sensitive', // Medical info, etc.
  CLIENT_FUNDING: 'client:funding',

  // Scheduling
  SCHEDULING_READ: 'scheduling:read',
  SCHEDULING_WRITE: 'scheduling:write',
  SCHEDULING_DELETE: 'scheduling:delete',
  SHIFT_CLOCK: 'shift:clock',
  SHIFT_APPROVE: 'shift:approve',

  // Billing
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  BILLING_APPROVE: 'billing:approve',
  BILLING_PAYMENT: 'billing:payment',

  // Incidents
  INCIDENT_READ: 'incident:read',
  INCIDENT_WRITE: 'incident:write',
  INCIDENT_SENSITIVE: 'incident:sensitive',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',
  REPORTS_EXPORT: 'reports:export',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  
  // Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_INVITE: 'users:invite',
  ROLES_MANAGE: 'roles:manage',
};

// Default role permission mappings
const ROLE_PERMISSIONS = {
  OWNER: ['*'],
  
  ADMIN: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_WRITE,
    PERMISSIONS.STAFF_DELETE,
    PERMISSIONS.STAFF_DOCUMENTS,
    PERMISSIONS.STAFF_LEAVE_APPROVE,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_WRITE,
    PERMISSIONS.CLIENT_DELETE,
    PERMISSIONS.CLIENT_SENSITIVE,
    PERMISSIONS.CLIENT_FUNDING,
    PERMISSIONS.SCHEDULING_READ,
    PERMISSIONS.SCHEDULING_WRITE,
    PERMISSIONS.SCHEDULING_DELETE,
    PERMISSIONS.SHIFT_APPROVE,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_WRITE,
    PERMISSIONS.INCIDENT_READ,
    PERMISSIONS.INCIDENT_WRITE,
    PERMISSIONS.INCIDENT_SENSITIVE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_WRITE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_INVITE,
  ],

  MANAGER: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_DOCUMENTS,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_WRITE,
    PERMISSIONS.SCHEDULING_READ,
    PERMISSIONS.SCHEDULING_WRITE,
    PERMISSIONS.SHIFT_APPROVE,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.INCIDENT_READ,
    PERMISSIONS.INCIDENT_WRITE,
    PERMISSIONS.REPORTS_READ,
  ],

  COORDINATOR: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_WRITE,
    PERMISSIONS.SCHEDULING_READ,
    PERMISSIONS.SCHEDULING_WRITE,
    PERMISSIONS.INCIDENT_READ,
    PERMISSIONS.INCIDENT_WRITE,
    PERMISSIONS.REPORTS_READ,
  ],

  STAFF: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.SCHEDULING_READ,
    PERMISSIONS.SHIFT_CLOCK,
    PERMISSIONS.INCIDENT_READ,
    PERMISSIONS.INCIDENT_WRITE,
  ],

  VIEWER: [
    PERMISSIONS.DASHBOARD_READ,
  ],
};

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };
```

---

## 7. Multi-Tenancy Implementation

### 7.1 Tenant Context Middleware

```javascript
// src/middleware/tenant.middleware.js
const prisma = require('../config/database');
const { NotFoundError } = require('../shared/errors');

/**
 * Injects organization context into request
 * Must run after auth middleware
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    const { organizationId } = req.user;

    if (!organizationId) {
      throw new NotFoundError('Organization not found');
    }

    // Fetch organization with settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        settings: true,
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    if (organization.status !== 'ACTIVE') {
      throw new NotFoundError('Organization is inactive');
    }

    // Attach organization context
    req.organization = organization;
    req.organizationId = organizationId;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tenantMiddleware;
```

### 7.2 Repository Pattern with Tenant Scope

```javascript
// src/modules/staff/staff.repository.js
const prisma = require('../../config/database');

class StaffRepository {
  /**
   * Find all staff members for an organization
   */
  async findAll(organizationId, options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      teamId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = {
      organizationId, // Always scope to organization
      ...(status && { status }),
      ...(teamId && {
        teamMembers: {
          some: { teamId },
        },
      }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.staffMember.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, role: true, lastLoginAt: true },
          },
          skills: true,
          teamMembers: {
            include: { team: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.staffMember.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find staff member by ID (organization-scoped)
   */
  async findById(organizationId, staffId) {
    return prisma.staffMember.findFirst({
      where: {
        id: staffId,
        organizationId, // Ensure belongs to organization
      },
      include: {
        user: true,
        skills: true,
        documents: true,
        availability: true,
        teamMembers: {
          include: { team: true },
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  /**
   * Create staff member
   */
  async create(organizationId, data) {
    return prisma.staffMember.create({
      data: {
        ...data,
        organizationId, // Always set organization
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Update staff member (organization-scoped)
   */
  async update(organizationId, staffId, data) {
    // First verify the staff belongs to this organization
    const existing = await this.findById(organizationId, staffId);
    if (!existing) {
      return null;
    }

    return prisma.staffMember.update({
      where: { id: staffId },
      data,
      include: {
        user: true,
        skills: true,
      },
    });
  }

  /**
   * Delete staff member (soft delete, organization-scoped)
   */
  async delete(organizationId, staffId) {
    const existing = await this.findById(organizationId, staffId);
    if (!existing) {
      return null;
    }

    return prisma.staffMember.update({
      where: { id: staffId },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }
}

module.exports = new StaffRepository();
```

---

## 8. API Design

### 8.1 RESTful Endpoint Structure

```
BASE URL: /api/v1

═══════════════════════════════════════════════════════════════
PLATFORM ADMIN ENDPOINTS (Super Admin)
═══════════════════════════════════════════════════════════════
POST   /platform/auth/login              # Platform admin login
POST   /platform/auth/logout             # Platform admin logout
GET    /platform/organizations           # List all organizations
POST   /platform/organizations           # Create organization
GET    /platform/organizations/:id       # Get organization
PATCH  /platform/organizations/:id       # Update organization
DELETE /platform/organizations/:id       # Delete organization
GET    /platform/subscriptions           # List subscriptions
GET    /platform/stats                   # Platform statistics

═══════════════════════════════════════════════════════════════
AUTHENTICATION ENDPOINTS
═══════════════════════════════════════════════════════════════
POST   /auth/login                       # User login
POST   /auth/logout                      # User logout
POST   /auth/refresh                     # Refresh token
POST   /auth/forgot-password             # Request password reset
POST   /auth/reset-password              # Reset password
GET    /auth/me                          # Get current user
PATCH  /auth/me                          # Update current user

═══════════════════════════════════════════════════════════════
ORGANIZATION ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /organization                     # Get current organization
PATCH  /organization                     # Update organization
GET    /organization/settings            # Get settings
PATCH  /organization/settings            # Update settings

═══════════════════════════════════════════════════════════════
USER MANAGEMENT ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /users                            # List users
POST   /users                            # Create user
GET    /users/:id                        # Get user
PATCH  /users/:id                        # Update user
DELETE /users/:id                        # Deactivate user
POST   /users/invite                     # Send invitation
GET    /roles                            # List roles
POST   /roles                            # Create custom role

═══════════════════════════════════════════════════════════════
STAFF MANAGEMENT ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /staff                            # List staff
POST   /staff                            # Create staff
GET    /staff/:id                        # Get staff
PATCH  /staff/:id                        # Update staff
DELETE /staff/:id                        # Deactivate staff
GET    /staff/:id/documents              # Get staff documents
POST   /staff/:id/documents              # Upload document
GET    /staff/:id/availability           # Get availability
PUT    /staff/:id/availability           # Set availability
GET    /staff/:id/leave                  # Get leave requests
POST   /staff/:id/leave                  # Request leave
GET    /teams                            # List teams
POST   /teams                            # Create team

═══════════════════════════════════════════════════════════════
CLIENT MANAGEMENT ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /clients                          # List clients
POST   /clients                          # Create client
GET    /clients/:id                      # Get client
PATCH  /clients/:id                      # Update client
DELETE /clients/:id                      # Archive client
GET    /clients/:id/funding              # Get funding sources
POST   /clients/:id/funding              # Add funding source
GET    /clients/:id/goals                # Get goals
POST   /clients/:id/goals                # Create goal
GET    /clients/:id/care-plans           # Get care plans
POST   /clients/:id/care-plans           # Create care plan

═══════════════════════════════════════════════════════════════
SCHEDULING ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /shifts                           # List shifts
POST   /shifts                           # Create shift
GET    /shifts/:id                       # Get shift
PATCH  /shifts/:id                       # Update shift
DELETE /shifts/:id                       # Delete shift
POST   /shifts/:id/clock-in              # Clock in
POST   /shifts/:id/clock-out             # Clock out
POST   /shifts/:id/progress-notes        # Add progress note
GET    /shifts/calendar                  # Calendar view
GET    /service-types                    # List service types
GET    /geofences                        # List geofences
POST   /geofences                        # Create geofence

═══════════════════════════════════════════════════════════════
BILLING ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /invoices                         # List invoices
POST   /invoices                         # Create invoice
GET    /invoices/:id                     # Get invoice
PATCH  /invoices/:id                     # Update invoice
POST   /invoices/:id/send                # Send invoice
GET    /invoices/:id/pdf                 # Download PDF
GET    /payments                         # List payments
POST   /payments                         # Record payment
GET    /price-guide                      # Get NDIS price guide
GET    /xero/status                      # Xero connection status
GET    /xero/connect                     # Initiate OAuth
POST   /xero/sync/invoices               # Sync invoices

═══════════════════════════════════════════════════════════════
INCIDENT ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /incidents                        # List incidents
POST   /incidents                        # Create incident
GET    /incidents/:id                    # Get incident
PATCH  /incidents/:id                    # Update incident
POST   /incidents/:id/follow-ups         # Add follow-up
GET    /complaints                       # List complaints
POST   /complaints                       # Create complaint

═══════════════════════════════════════════════════════════════
COMMUNICATION ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /messages                         # List messages
POST   /messages                         # Send message
GET    /notifications                    # Get notifications
PATCH  /notifications/:id/read           # Mark as read
POST   /email/send                       # Send email
POST   /sms/send                         # Send SMS

═══════════════════════════════════════════════════════════════
FORMS & DOCUMENTS ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /forms/templates                  # List templates
POST   /forms/templates                  # Create template
GET    /forms/submissions                # List submissions
POST   /forms/submissions                # Submit form
GET    /documents                        # List documents
POST   /documents                        # Upload document
GET    /documents/:id/download           # Download document

═══════════════════════════════════════════════════════════════
REPORTS ENDPOINTS
═══════════════════════════════════════════════════════════════
GET    /reports/dashboard                # Dashboard widgets
GET    /reports/kpis                     # KPI values
GET    /reports/staff-utilization        # Staff utilization
GET    /reports/billing-summary          # Billing summary
POST   /reports/export                   # Generate export
GET    /audit-logs                       # List audit logs
```

### 8.2 Standard Response Format

```javascript
// src/shared/utils/response.util.js

/**
 * Success response
 */
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Success response with pagination
 */
const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Created response
 */
const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Error response
 */
const error = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { success, paginated, created, error };
```

### 8.3 Request Validation with Joi

```javascript
// src/modules/staff/staff.validator.js
const Joi = require('joi');

const createStaffSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.object({
    street: Joi.string().max(200),
    suburb: Joi.string().max(100),
    state: Joi.string().max(50),
    postcode: Joi.string().max(10),
    country: Joi.string().max(100).default('Australia'),
  }).optional(),
  employmentType: Joi.string()
    .valid('FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACT')
    .required(),
  startDate: Joi.date().required(),
  hourlyRate: Joi.number().positive().optional(),
});

const listStaffSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE'),
  sortBy: Joi.string().valid('firstName', 'lastName', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createStaffSchema, listStaffSchema };
```

---

## 9. Security Implementation

### 9.1 Security Checklist

| Category | Implementation | Status |
|----------|---------------|--------|
| **Authentication** | JWT with refresh tokens | Required |
| **Password** | bcrypt with 12 rounds | Required |
| **Rate Limiting** | 100 req/min per IP | Required |
| **Input Validation** | Joi schemas | Required |
| **SQL Injection** | Prisma parameterized queries | Built-in |
| **XSS** | helmet + sanitization | Required |
| **CORS** | Whitelist origins | Required |
| **HTTPS** | TLS 1.3 | Required |
| **Audit Logging** | All mutations logged | Required |

### 9.2 Security Middleware Setup

```javascript
// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const compression = require('compression');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, message: 'Too many requests' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(xss());
app.use(compression());

module.exports = app;
```

### 9.3 Password Hashing

```javascript
// src/shared/utils/crypto.util.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = { hashPassword, comparePassword, generateToken };
```

---

## 10. External Integrations

### 10.1 Xero OAuth 2.0 Integration

```javascript
// src/modules/billing/xero/xero.auth.js
const { XeroClient } = require('xero-node');
const prisma = require('../../../config/database');

class XeroAuthService {
  constructor() {
    this.xero = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUris: [process.env.XERO_REDIRECT_URI],
      scopes: ['openid', 'profile', 'accounting.transactions', 'accounting.contacts'],
    });
  }

  getAuthUrl(organizationId) {
    const state = Buffer.from(JSON.stringify({ organizationId })).toString('base64');
    return this.xero.buildConsentUrl() + `&state=${state}`;
  }

  async handleCallback(code, state) {
    const { organizationId } = JSON.parse(Buffer.from(state, 'base64').toString());
    const tokenSet = await this.xero.apiCallback(code);
    await this.xero.updateTenants();
    
    await prisma.xeroConnection.upsert({
      where: { organizationId },
      create: {
        organizationId,
        xeroTenantId: this.xero.tenants[0].tenantId,
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        tokenExpiresAt: new Date(tokenSet.expires_at * 1000),
      },
      update: {
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        tokenExpiresAt: new Date(tokenSet.expires_at * 1000),
      },
    });

    return { success: true };
  }
}

module.exports = new XeroAuthService();
```

### 10.2 File Storage (S3)

```javascript
// src/config/storage.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class StorageService {
  async upload(file, folder, organizationId) {
    const fileName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    const key = `${organizationId}/${folder}/${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return { key, fileName: file.originalname, fileSize: file.size };
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }
}

module.exports = new StorageService();
```

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
                    ┌───────────┐
                    │    E2E    │  ~10%
                   ─┴───────────┴─
                 ┌─────────────────┐
                 │   Integration   │  ~30%
               ──┴─────────────────┴──
             ┌─────────────────────────┐
             │         Unit            │  ~60%
           ──┴─────────────────────────┴──
```

### 11.2 Test Setup

```javascript
// tests/setup.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset test database
});

afterAll(async () => {
  await prisma.$disconnect();
});

global.createTestContext = async () => {
  const organization = await prisma.organization.create({
    data: { name: 'Test Org', slug: `test-${Date.now()}`, email: 'test@example.com' },
  });
  const user = await prisma.user.create({
    data: { email: `test-${Date.now()}@example.com`, passwordHash: 'hash', role: 'ADMIN', organizationId: organization.id },
  });
  return { organization, user };
};
```

---

## 12. DevOps & Deployment

### 12.1 Docker Configuration

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system nodejs && adduser --system expressjs
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
USER expressjs
EXPOSE 3000
CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ndassist
      - REDIS_URL=redis://redis:6379
    depends_on: [db, redis]

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ndassist
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

volumes:
  postgres_data:
  redis_data:
```

### 12.2 Environment Configuration

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/ndassist"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=ndassist-files
XERO_CLIENT_ID=your-xero-client-id
XERO_CLIENT_SECRET=your-xero-client-secret
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 13. Performance Optimization

### 13.1 Database Query Optimization

```javascript
// Efficient queries with selective includes
const getShifts = async (organizationId, filters) => {
  return prisma.shift.findMany({
    where: { organizationId, ...filters },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      staffMember: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};
```

### 13.2 Caching Strategy

```javascript
// src/shared/utils/cache.util.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

class CacheService {
  async getOrSet(key, fetchFn, ttlSeconds = 300) {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    
    const data = await fetchFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  }

  async invalidate(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  }
}

module.exports = new CacheService();
```

---

## 14. Monitoring & Logging

### 14.1 Structured Logging with Pino

```javascript
// src/config/logger.js
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: ['req.headers.authorization', 'password', 'token'],
});

module.exports = logger;
```

### 14.2 Health Check

```javascript
// src/modules/system/health.controller.js
const prisma = require('../../config/database');

const healthCheck = async (req, res) => {
  const health = { status: 'healthy', timestamp: new Date().toISOString(), checks: {} };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = { status: 'healthy' };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = { status: 'unhealthy', error: error.message };
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
};

module.exports = { healthCheck };
```

---

## 15. Timeline Estimate

### Summary: 16 Weeks

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Foundation** | Week 1-2 | Setup, Auth, Platform Admin |
| **Phase 2: Core Modules** | Week 3-5 | Users, Staff, Clients, RBAC |
| **Phase 3: Operations** | Week 6-8 | Scheduling, Clock, Incidents |
| **Phase 4: Billing** | Week 9-11 | Invoicing, Payments, Xero |
| **Phase 5: Communication** | Week 12-13 | Messaging, Notifications, Reports |
| **Phase 6: Polish** | Week 14-16 | Testing, Optimization, Deployment |

### Milestones

```
Week 2  ──► MVP Auth & Platform Admin
Week 5  ──► Core Staff/Client Management
Week 8  ──► Full Scheduling System
Week 11 ──► Billing & Xero Integration
Week 13 ──► All Features Complete
Week 16 ──► Production Launch
```

---

## Appendix: Package.json

```json
{
  "name": "ndassist-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src/",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "seed": "node prisma/seed/index.js"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.490.0",
    "@aws-sdk/s3-request-presigner": "^3.490.0",
    "@prisma/client": "^5.8.0",
    "bcrypt": "^5.1.1",
    "bullmq": "^5.1.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dayjs": "^1.11.10",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "joi": "^17.12.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.8",
    "pino": "^8.17.2",
    "pino-http": "^9.0.0",
    "socket.io": "^4.6.1",
    "xero-node": "^4.35.0",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "pino-pretty": "^10.3.1",
    "prisma": "^5.8.0",
    "supertest": "^6.3.4"
  }
}
```

---

## Quick Start

```bash
# Clone and setup
git clone <repo>
cd ndassist-backend
cp .env.example .env
npm install

# Start development
docker-compose up -d db redis
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev

# Server running at http://localhost:3000
```

---

**Document Version**: 1.0  
**Last Updated**: February 2025
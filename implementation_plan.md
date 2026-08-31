# KOC Job Management System — Implementation Plan

## Overview

A full-stack monorepo application to replace a manually maintained Excel spreadsheet for KOC (Key Opinion Consumer) job management. The core principle: **enter job information once, and the system automatically generates tasks, deadlines, reminders, and payment tracking.**

---

## Architecture Summary

```
Next.js (Presentation)
    │  REST API calls
    ▼
NestJS (API + Business Logic)
    │  Prisma ORM
    ▼
PostgreSQL (Persistent Data)
    │  Docker Compose
    ▼
Docker Container
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, React, Tailwind CSS, shadcn/ui, React Hook Form, Zod |
| Backend | NestJS, TypeScript, Passport.js, JWT |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose |
| Monorepo | npm workspaces (simple, no Turborepo overhead for MVP) |
| Testing | Jest (NestJS built-in) |

---

## Monorepo Structure

```
koc-manager/
│
├── apps/
│   ├── web/                          # Next.js 14 (App Router)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── jobs/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── new/
│   │   │   │   │   ├── brands/
│   │   │   │   │   ├── templates/
│   │   │   │   │   ├── payments/
│   │   │   │   │   └── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── jobs/
│   │   │   │   ├── brands/
│   │   │   │   ├── templates/
│   │   │   │   └── dashboard/
│   │   │   ├── lib/
│   │   │   │   ├── api/              # API client functions
│   │   │   │   ├── auth/             # Auth context/hooks
│   │   │   │   └── validation/       # Shared Zod schemas
│   │   │   └── types/                # Frontend type definitions
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.module.ts
│       │   │   ├── dto/
│       │   │   │   ├── login.dto.ts
│       │   │   │   └── register.dto.ts
│       │   │   ├── guards/
│       │   │   │   └── jwt-auth.guard.ts
│       │   │   └── strategies/
│       │   │       └── jwt.strategy.ts
│       │   ├── users/
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   └── users.module.ts
│       │   ├── brands/
│       │   │   ├── brands.controller.ts
│       │   │   ├── brands.service.ts
│       │   │   ├── brands.module.ts
│       │   │   └── dto/
│       │   ├── jobs/
│       │   │   ├── jobs.controller.ts
│       │   │   ├── jobs.service.ts
│       │   │   ├── jobs.module.ts
│       │   │   └── dto/
│       │   ├── job-tasks/
│       │   │   ├── job-tasks.controller.ts
│       │   │   ├── job-tasks.service.ts
│       │   │   ├── job-tasks.module.ts
│       │   │   └── dto/
│       │   ├── job-templates/
│       │   │   ├── job-templates.controller.ts
│       │   │   ├── job-templates.service.ts
│       │   │   ├── job-templates.module.ts
│       │   │   └── dto/
│       │   ├── contents/
│       │   ├── payments/
│       │   ├── notifications/
│       │   ├── tiktok/
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   │   └── current-user.decorator.ts
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   └── response.interceptor.ts
│       │   │   └── pipes/
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts
│       │   │   └── prisma.service.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/
│       └── package.json
│
├── packages/
│   └── database/                     # Shared Prisma package
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── src/
│       │   └── index.ts              # Re-exports PrismaClient
│       └── package.json
│
├── docker/
│   └── postgres/
│       └── init.sql
│
├── docker-compose.yml
├── .env.example
├── package.json                      # Root workspace package.json
└── README.md
```

---

## Database Schema (Prisma)

### All Models Include

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
```

### Enums

```prisma
enum JobType      { PRODUCT_REVIEW, EVENT, SELF_PURCHASE, CONTENT_CREATION, AFFILIATE, OTHER }
enum JobStatus    { DRAFT, NEW, WAITING_PRODUCT, PRODUCT_RECEIVED, CREATING, DEMO, REVISION,
                    READY_TO_POST, POSTED, WAITING_PAYMENT, PAID, COMPLETED, CANCELLED }
enum TaskStatus   { TODO, IN_PROGRESS, COMPLETED, SKIPPED }
enum ContentType  { VIDEO, PHOTO, STORY, POST, OTHER }
enum ContentStatus{ PLANNING, SHOOTING, EDITING, DEMO, REVISION, APPROVED, PUBLISHED }
enum PaymentStatus{ PENDING, REQUESTED, PAID, OVERDUE, CANCELLED }
enum PaymentMethod{ BANK_TRANSFER, CASH, E_WALLET, OTHER }
enum NotifType    { TASK_DUE, TASK_OVERDUE, PAYMENT_DUE, PAYMENT_OVERDUE, JOB_REMINDER }
```

### Models

All 13 models will be created:
`User`, `TikTokAccount`, `Brand`, `Job`, `JobTask`, `JobNote`, `JobAttachment`, `JobTemplate`, `TemplateTask`, `Content`, `ContentAsset`, `Payment`, `Notification`

### Key Indexes

- `Job`: userId, brandId, status, postDate, paymentExpectedDate, deletedAt
- `JobTask`: jobId, status, dueDate, deletedAt
- `Payment`: jobId, status, expectedDate, deletedAt
- `Notification`: userId, isRead, scheduledAt, deletedAt
- Partial unique index on `Brand(userId, name)` WHERE `deletedAt IS NULL`

> [!IMPORTANT]
> Soft delete is enforced at the **service layer** — all `findMany` calls include `{ deletedAt: null }`. A shared Prisma extension/helper will enforce this consistently.

---

## NestJS API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Jobs
```
GET    /api/jobs            (paginated, filterable: status, brandId, search, dateFrom, dateTo)
POST   /api/jobs            (creates job + auto-generates tasks if templateId provided)
GET    /api/jobs/:id
PATCH  /api/jobs/:id
DELETE /api/jobs/:id        (soft delete)
```

### Job Tasks
```
GET    /api/jobs/:jobId/tasks
POST   /api/jobs/:jobId/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id       (soft delete)
```

### Brands
```
GET    /api/brands
POST   /api/brands
GET    /api/brands/:id
PATCH  /api/brands/:id
DELETE /api/brands/:id      (soft delete)
```

### Job Templates
```
GET    /api/job-templates
POST   /api/job-templates
GET    /api/job-templates/:id
PATCH  /api/job-templates/:id
DELETE /api/job-templates/:id  (soft delete)
```

### Payments
```
GET    /api/jobs/:jobId/payments
POST   /api/jobs/:jobId/payments
PATCH  /api/payments/:id
DELETE /api/payments/:id    (soft delete)
```

### Standard Response Shape
```json
{ "data": {}, "message": "Success" }
{ "data": [], "meta": { "page": 1, "limit": 20, "total": 100 } }
```

---

## Core Business Logic

### Automatic Task Generation (Most Critical)

When `POST /api/jobs` is called with a `templateId` and `postDate`:

```
1. Validate authenticated user
2. Validate Brand belongs to user (deletedAt IS NULL)
3. Validate JobTemplate belongs to user (deletedAt IS NULL)
4. prisma.$transaction([
     a. Create Job record
     b. Fetch TemplateTask[] ordered by order ASC
     c. For each TemplateTask:
          dueDate = postDate - daysBeforePost days
          Create JobTask with this dueDate
   ])
5. Return Job with tasks
```

### Task Date Calculation Example
```
postDate: 2026-09-10
TemplateTask.daysBeforePost = 3
→ JobTask.dueDate = 2026-09-07
```

### Business Rules
- Job soft delete: sets `deletedAt = NOW()`, does NOT cascade delete tasks/payments/content
- Task COMPLETED: set `completedAt = NOW()`
- Task reopened: clear `completedAt = null`
- Payment PAID: set `paidDate = NOW()` (unless explicit date supplied)
- Job status is controlled manually by business rules, not auto-completed from tasks

---

## Authentication

- **JWT-based** authentication (stateless, suitable for REST API)
- Passwords hashed with **bcrypt** (cost factor 12)
- JWT stored in **httpOnly cookie** (more secure than localStorage)
- `@CurrentUser()` decorator to extract user from JWT in controllers
- All protected routes use `JwtAuthGuard`
- `passwordHash` is **never** returned in API responses
- TikTok `accessToken`/`refreshToken` are **never** returned to frontend

---

## Frontend Pages

| Route | Purpose |
|---|---|
| `/login` | Authentication |
| `/register` | New user registration |
| `/dashboard` | Today's tasks, upcoming, overdue, payment summary |
| `/jobs` | Job list with filters |
| `/jobs/new` | Create job (brand → template → details → create) |
| `/jobs/[id]` | Job detail: info, tasks checklist, content, payment, notes |
| `/brands` | Brand management |
| `/templates` | Job template management |
| `/templates/[id]` | Template detail + task management |
| `/payments` | Payment overview |
| `/settings` | User settings |

---

## Seed Data

### Brands (7)
Omo, Ensure, Revive, Nguyen Kim, Clearman, SHARP, Liberty

### Templates (6) with TemplateTasks
- **Product Review**: Receive product → Read brief → Prepare content → Shoot → Edit → Submit demo → Revision → Post → Receive payment
- **Video + Photos**: Similar flow with photo-specific tasks
- **Event**: Event attendance tasks
- **Self Purchase**: Purchase + receipt tasks
- **Talking Advertisement**: Script → Record → Edit → Demo → Post
- **TikTok Filter**: Filter design → Test → Publish

### Example Jobs (12)
Based on: Xe Liberty, Wakeup247, Omo, MV Duy Khánh, MLV viên uống, Kem đánh răng PS, Revive, Clearman, Nguyễn Kim, Filter TikTok, Sự kiện SHARP, Ensure

---

## Testing Plan (Jest)

10 critical test cases:

1. User registration
2. User login
3. Job creation (no template)
4. Job creation with template → tasks auto-generated
5. Task date calculation accuracy
6. User cannot access another user's Job (401/403)
7. Job soft deletion
8. Soft-deleted Job absent from normal list queries
9. Payment status → PAID sets paidDate
10. Brand ownership validation on job creation

---

## Implementation Phases

| Phase | Task |
|---|---|
| 1 | Monorepo setup (root package.json, npm workspaces) |
| 2 | Docker Compose + PostgreSQL |
| 3 | Prisma schema (all 13 models, enums, indexes) |
| 4 | Prisma migration (`prisma migrate dev`) |
| 5 | Seed data (brands, templates, example jobs) |
| 6 | NestJS setup (app.module, main.ts, prisma service) |
| 7 | Authentication (register, login, logout, JWT, guards) |
| 8 | Brand CRUD |
| 9 | Job Template CRUD + TemplateTask management |
| 10 | Job CRUD |
| 11 | Automatic JobTask generation (transaction) |
| 12 | Payment CRUD |
| 13 | Soft-delete verification (service layer tests) |
| 14 | Backend unit tests (10 cases) |
| 15 | Next.js setup + auth pages + API client |
| 16 | Dashboard page |
| 17 | Job list + job detail page + new job flow |

---

## Open Questions

> [!IMPORTANT]
> **Project Location**: The requirement references `koc-manager/` as the root. Should I create this inside your existing workspace `d:\Myproject\KOCManagerment\K-job\`, making the full path `d:\Myproject\KOCManagerment\K-job\`? Or should I create a fresh `koc-manager` subdirectory inside it?

> [!IMPORTANT]
> **Monorepo Tooling**: The spec allows npm workspaces, pnpm workspaces, or Turborepo. I recommend **npm workspaces** for simplicity (no additional tools). Do you agree, or do you prefer pnpm?

> [!IMPORTANT]
> **Frontend Language**: The spec lists Vietnamese brand/job names (Omo, Xe Liberty, etc.) and a Vietnamese context. Should the UI be in **English** (as a professional SaaS) or **Vietnamese**? Or bilingual?

> [!NOTE]
> **Auth Token Storage**: I'll use **httpOnly cookies** for JWT storage (more secure against XSS). This is recommended, but requires the Next.js app and NestJS API to run on the same domain or proper CORS + cookie settings. In development, Next.js runs on `:3000` and NestJS on `:3001`. This is handled via API proxy configuration.

> [!NOTE]
> **Future Redis/BullMQ**: I'll add commented-out Docker Compose service blocks for Redis so it's trivial to uncomment later. No actual Redis code will be written now.

---

## Verification Plan

### Automated
```bash
cd apps/api && npm test
```
All 10 critical test cases pass.

### Manual (Final Acceptance Test)
1. `docker-compose up -d` → PostgreSQL healthy
2. `npm run db:migrate` → migrations applied
3. `npm run db:seed` → seed data present
4. `npm run dev` → both apps running
5. Register → Login → Create Brand → Create Template → Create Job → Verify tasks generated with correct dates → Mark tasks complete → Create Payment → Mark PAID → Soft delete job → Verify job absent from list

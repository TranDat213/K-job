# 🚀 KOC Management Platform (K-job)

System for managing KOC (Key Opinion Leader / Key Opinion Consumer) jobs, campaigns, brands, deliverables, and payment workflows.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Start Database (Docker)](#3-start-database-docker)
  - [4. Database Migration & Seed](#4-database-migration--seed)
  - [5. Run Development Servers](#5-run-development-servers)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [Database Schema & Models](#-database-schema--models)
- [License](#-license)

---

## 🌟 Overview

**K-Job (KOC Manager)** is a comprehensive monorepo platform tailored for KOCs, influencers, and talent managers to efficiently manage collaboration jobs, content delivery schedules, brand relationships, payment tracking, and TikTok channel integrations.

---

## 🛠 Tech Stack

### Monorepo Architecture
- **Package Manager**: npm workspaces

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4, Lucide React
- **Form & Validation**: React Hook Form, Zod

### Backend (`apps/api`)
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Authentication**: JWT, Passport.js, Bcrypt
- **Validation**: Class Validator & Class Transformer

### Database & Shared Packages (`packages/database`)
- **Database**: PostgreSQL 16
- **ORM**: Prisma ORM
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Architecture

```text
K-job/
├── apps/
│   ├── api/                 # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── auth/        # Authentication & JWT Strategies
│   │   │   ├── users/       # User Management Module
│   │   │   ├── prisma/      # Prisma Module wrapper
│   │   │   └── common/      # Interceptors, Filters, Decorators
│   │   └── package.json
│   └── web/                 # Next.js Frontend Application
│       ├── app/             # App Router Pages (Login, Register, Dashboard)
│       ├── lib/             # API Client & Helpers
│       └── package.json
├── packages/
│   └── database/            # Shared Database package
│       ├── prisma/          # Schema definitions & migrations
│       └── package.json
├── docker/
│   └── postgres/            # Postgres initialization scripts
├── docker-compose.yml       # Docker Compose setup for local DB
├── .env.example             # Example Environment Variables
└── package.json             # Root monorepo configuration
```

---

## ✨ Features

- 🔑 **Authentication & Authorization**: Secure JWT-based Login & Registration.
- 💼 **Job & Campaign Management**: Track jobs across lifecycle stages (`DRAFT`, `NEW`, `WAITING_PRODUCT`, `CREATING`, `DEMO`, `POSTED`, `COMPLETED`, etc.).
- 🏷️ **Brand Management**: Keep track of brand contacts and collaboration history.
- 📋 **Job Templates & Tasks**: Workflow task automation for content creation schedules.
- 🎥 **Content & Asset Management**: Video/photo draft submission, revision tracking, and TikTok link integration.
- 💳 **Payment & Financial Tracking**: Track pending, requested, and paid invoices.
- 🔔 **Notifications**: Reminders for task deadlines, payment due dates, and job milestones.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Docker & Docker Compose** (for running PostgreSQL locally)

---

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd K-job

# Install all dependencies across monorepo workspaces
npm install
```

---

### 2. Environment Configuration

Copy `.env.example` to create `.env` in the root folder:

```bash
cp .env.example .env
```

Ensure default environment settings suit your local setup:

```env
POSTGRES_USER=koc_user
POSTGRES_PASSWORD=koc_password
POSTGRES_DB=koc_manager
POSTGRES_PORT=5334

DATABASE_URL="postgresql://koc_user:koc_password@localhost:5334/koc_manager?schema=public"

API_PORT=3002
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

### 3. Start Database (Docker)

Spin up PostgreSQL container:

```bash
docker-compose up -d postgres
```

---

### 4. Database Migration & Seed

Run database migrations to generate database tables:

```bash
# Generate Prisma Client
npm run db:generate

# Run Database Migrations
npm run db:migrate
```

*(Optional) Launch Prisma Studio to inspect data visually:*
```bash
npm run db:studio
```

---

### 5. Run Development Servers

Start both the backend API and Next.js frontend concurrently:

```bash
npm run dev
```

- 🌐 **Frontend**: `http://localhost:3000`
- ⚡ **Backend API**: `http://localhost:3002`

---

## 📜 NPM Scripts Reference

Running from the monorepo root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both API and Web applications concurrently |
| `npm run dev:api` | Runs NestJS Backend in watch mode |
| `npm run dev:web` | Runs Next.js Frontend in development mode |
| `npm run db:generate` | Generates Prisma client types |
| `npm run db:migrate` | Runs database migrations in dev |
| `npm run db:studio` | Opens Prisma Studio GUI |
| `npm run build` | Builds all packages and applications |
| `npm run test` | Runs unit tests for backend API |

---

## 🗄 Database Schema & Models

- `User`: User accounts & profiles
- `TikTokAccount`: Linked TikTok creator accounts
- `Brand`: Client brands & contacts
- `JobTemplate` & `TemplateTask`: Reusable job workflow templates
- `Job` & `JobTask`: KOC campaign jobs & step-by-step tasks
- `Content` & `ContentAsset`: Video/Photo deliverables & status tracking
- `Payment`: Invoice & payment tracking
- `Notification`: In-app task & payment alerts

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

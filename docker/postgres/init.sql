-- PostgreSQL initialization script
-- This runs once when the container is first created

-- Ensure the database exists (it's already created by POSTGRES_DB env var)
-- Add any initial extensions or settings here

-- Enable UUID extension (optional, we use CUID from Prisma)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for future full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add QUOTED to RequestStatus enum
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'QUOTED';

-- Add budget field to Request
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "budget" TEXT;

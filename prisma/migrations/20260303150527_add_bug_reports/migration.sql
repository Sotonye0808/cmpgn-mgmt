-- CreateEnum
CREATE TYPE "BugReportCategory" AS ENUM ('UI_ISSUE', 'DATA_ISSUE', 'PERFORMANCE', 'FEATURE_REQUEST', 'ACCESS_AUTH', 'OTHER');

-- CreateEnum
CREATE TYPE "BugReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "BugReport" (
    "id" TEXT NOT NULL,
    "category" "BugReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "pageUrl" TEXT,
    "status" "BugReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BugReport_status_idx" ON "BugReport"("status");

-- CreateIndex
CREATE INDEX "BugReport_category_idx" ON "BugReport"("category");

-- CreateIndex
CREATE INDEX "BugReport_userId_idx" ON "BugReport"("userId");

-- CreateIndex
CREATE INDEX "BugReport_createdAt_idx" ON "BugReport"("createdAt");

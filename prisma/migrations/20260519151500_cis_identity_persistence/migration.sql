-- Create CIS Identity and Webhook Event tables for CIS federation integration
-- Additive migration - only adds new tables, does not modify existing schema

-- Create CisIdentity table
CREATE TABLE "CisIdentity" (
    "id" TEXT NOT NULL,
    "cisSubjectId" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "externalUserId" TEXT,
    "linkedUserId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "displayName" TEXT,
    "role" TEXT,
    "status" TEXT,
    "lastEventType" TEXT NOT NULL,
    "lastEventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CisIdentity_pkey" PRIMARY KEY ("id")
);

-- Create CisWebhookEvent table
CREATE TABLE "CisWebhookEvent" (
    "id" TEXT NOT NULL,
    "identityId" TEXT,
    "eventType" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "subjectId" TEXT,
    "externalUserId" TEXT,
    "payload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CisWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- Create indexes for CisIdentity
CREATE UNIQUE INDEX "CisIdentity_cisSubjectId_sourcePlatform_key" ON "CisIdentity"("cisSubjectId", "sourcePlatform");
CREATE UNIQUE INDEX "CisIdentity_externalUserId_key" ON "CisIdentity"("externalUserId");
CREATE INDEX "CisIdentity_linkedUserId_idx" ON "CisIdentity"("linkedUserId");
CREATE INDEX "CisIdentity_email_idx" ON "CisIdentity"("email");

-- Create indexes for CisWebhookEvent
CREATE INDEX "CisWebhookEvent_identityId_idx" ON "CisWebhookEvent"("identityId");
CREATE INDEX "CisWebhookEvent_eventType_idx" ON "CisWebhookEvent"("eventType");
CREATE INDEX "CisWebhookEvent_sourcePlatform_idx" ON "CisWebhookEvent"("sourcePlatform");

-- Add foreign key for linkedUser
ALTER TABLE "CisIdentity" ADD CONSTRAINT "CisIdentity_linkedUserId_fkey"
    FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key for identity in webhook events
ALTER TABLE "CisWebhookEvent" ADD CONSTRAINT "CisWebhookEvent_identityId_fkey"
    FOREIGN KEY ("identityId") REFERENCES "CisIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
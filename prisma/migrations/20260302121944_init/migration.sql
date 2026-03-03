-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignMediaType" AS ENUM ('IMAGE', 'VIDEO', 'LINK', 'TEXT');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SHARES', 'CLICKS', 'REFERRALS', 'DONATIONS', 'PARTICIPANTS');

-- CreateEnum
CREATE TYPE "LinkEventType" AS ENUM ('VIEW', 'CLICK', 'SHARE', 'CONVERSION', 'REFERRAL');

-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('IMPACT', 'CONSISTENCY', 'LEADERSHIP', 'RELIABILITY');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'RECEIVED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrustFlag" AS ENUM ('DUPLICATE_ACTIVITY', 'ABNORMAL_CLICKS', 'SUSPICIOUS_DEVICE', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TWITTER_X', 'TIKTOK', 'YOUTUBE', 'WHATSAPP', 'SNAPCHAT');

-- CreateEnum
CREATE TYPE "ViewProofStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignAuditEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'FIELDS_UPDATED', 'PARTICIPANT_JOINED', 'DONATION_RECEIVED', 'GOAL_REACHED', 'ENDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CAMPAIGN_UPDATE', 'REFERRAL_JOINED', 'POINTS_EARNED', 'TRUST_FLAG', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "profilePicture" TEXT,
    "whatsappNumber" TEXT,
    "teamId" TEXT,
    "trustScore" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "weaponsOfChoice" "SocialPlatform"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media" JSONB NOT NULL DEFAULT '[]',
    "mediaType" "CampaignMediaType",
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "goalType" "GoalType",
    "goalTarget" INTEGER,
    "goalCurrent" INTEGER DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetAudience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaImage" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER DEFAULT 0,
    "participantCount" INTEGER DEFAULT 0,
    "isMegaCampaign" BOOLEAN DEFAULT false,
    "parentCampaignId" TEXT,
    "bankAccountIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "smartLinkId" TEXT,

    CONSTRAINT "CampaignParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueClickCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkEvent" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "smartLinkId" TEXT,
    "slug" TEXT,
    "eventType" "LinkEventType" NOT NULL,
    "type" "LinkEventType",
    "userId" TEXT,
    "ipAddress" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "proofScreenshotUrl" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "type" "PointType" NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "period" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 100,
    "flags" "TrustFlag"[],
    "lastReviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewProof" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "smartLinkId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "status" "ViewProofStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxTeams" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "teamLeadId" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInviteLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 50,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignAuditEvent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "eventType" "CampaignAuditEventType" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_teamId_idx" ON "User"("teamId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_createdById_idx" ON "Campaign"("createdById");

-- CreateIndex
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "Campaign_parentCampaignId_idx" ON "Campaign"("parentCampaignId");

-- CreateIndex
CREATE INDEX "CampaignParticipation_userId_idx" ON "CampaignParticipation"("userId");

-- CreateIndex
CREATE INDEX "CampaignParticipation_campaignId_idx" ON "CampaignParticipation"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignParticipation_userId_campaignId_key" ON "CampaignParticipation"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartLink_slug_key" ON "SmartLink"("slug");

-- CreateIndex
CREATE INDEX "SmartLink_slug_idx" ON "SmartLink"("slug");

-- CreateIndex
CREATE INDEX "SmartLink_userId_idx" ON "SmartLink"("userId");

-- CreateIndex
CREATE INDEX "SmartLink_campaignId_idx" ON "SmartLink"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartLink_userId_campaignId_key" ON "SmartLink"("userId", "campaignId");

-- CreateIndex
CREATE INDEX "LinkEvent_linkId_idx" ON "LinkEvent"("linkId");

-- CreateIndex
CREATE INDEX "LinkEvent_eventType_idx" ON "LinkEvent"("eventType");

-- CreateIndex
CREATE INDEX "LinkEvent_createdAt_idx" ON "LinkEvent"("createdAt");

-- CreateIndex
CREATE INDEX "LinkEvent_userId_idx" ON "LinkEvent"("userId");

-- CreateIndex
CREATE INDEX "Referral_inviterId_idx" ON "Referral"("inviterId");

-- CreateIndex
CREATE INDEX "Referral_inviteeId_idx" ON "Referral"("inviteeId");

-- CreateIndex
CREATE INDEX "Referral_campaignId_idx" ON "Referral"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_inviteeId_slug_key" ON "Referral"("inviteeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_reference_key" ON "Donation"("reference");

-- CreateIndex
CREATE INDEX "Donation_userId_idx" ON "Donation"("userId");

-- CreateIndex
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");

-- CreateIndex
CREATE INDEX "Donation_status_idx" ON "Donation"("status");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_userId_idx" ON "PointsLedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_campaignId_idx" ON "PointsLedgerEntry"("campaignId");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_type_idx" ON "PointsLedgerEntry"("type");

-- CreateIndex
CREATE INDEX "PointsLedgerEntry_createdAt_idx" ON "PointsLedgerEntry"("createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_userId_idx" ON "LeaderboardSnapshot"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_campaignId_idx" ON "LeaderboardSnapshot"("campaignId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_period_idx" ON "LeaderboardSnapshot"("period");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_createdAt_idx" ON "LeaderboardSnapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrustScore_userId_key" ON "TrustScore"("userId");

-- CreateIndex
CREATE INDEX "TrustScore_userId_idx" ON "TrustScore"("userId");

-- CreateIndex
CREATE INDEX "TrustScore_score_idx" ON "TrustScore"("score");

-- CreateIndex
CREATE INDEX "AppNotification_userId_idx" ON "AppNotification"("userId");

-- CreateIndex
CREATE INDEX "AppNotification_isRead_idx" ON "AppNotification"("isRead");

-- CreateIndex
CREATE INDEX "AppNotification_createdAt_idx" ON "AppNotification"("createdAt");

-- CreateIndex
CREATE INDEX "ViewProof_userId_idx" ON "ViewProof"("userId");

-- CreateIndex
CREATE INDEX "ViewProof_campaignId_idx" ON "ViewProof"("campaignId");

-- CreateIndex
CREATE INDEX "ViewProof_status_idx" ON "ViewProof"("status");

-- CreateIndex
CREATE INDEX "ViewProof_createdAt_idx" ON "ViewProof"("createdAt");

-- CreateIndex
CREATE INDEX "Group_name_idx" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Team_groupId_idx" ON "Team"("groupId");

-- CreateIndex
CREATE INDEX "Team_teamLeadId_idx" ON "Team"("teamLeadId");

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInviteLink_token_key" ON "TeamInviteLink"("token");

-- CreateIndex
CREATE INDEX "TeamInviteLink_token_idx" ON "TeamInviteLink"("token");

-- CreateIndex
CREATE INDEX "TeamInviteLink_teamId_idx" ON "TeamInviteLink"("teamId");

-- CreateIndex
CREATE INDEX "CampaignAuditEvent_campaignId_idx" ON "CampaignAuditEvent"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignAuditEvent_actorId_idx" ON "CampaignAuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "CampaignAuditEvent_createdAt_idx" ON "CampaignAuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_parentCampaignId_fkey" FOREIGN KEY ("parentCampaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartLink" ADD CONSTRAINT "SmartLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartLink" ADD CONSTRAINT "SmartLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkEvent" ADD CONSTRAINT "LinkEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SmartLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsLedgerEntry" ADD CONSTRAINT "PointsLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsLedgerEntry" ADD CONSTRAINT "PointsLedgerEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustScore" ADD CONSTRAINT "TrustScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewProof" ADD CONSTRAINT "ViewProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewProof" ADD CONSTRAINT "ViewProof_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewProof" ADD CONSTRAINT "ViewProof_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInviteLink" ADD CONSTRAINT "TeamInviteLink_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInviteLink" ADD CONSTRAINT "TeamInviteLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditEvent" ADD CONSTRAINT "CampaignAuditEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignAuditEvent" ADD CONSTRAINT "CampaignAuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Multi-screenshot proofs + campaign team-lead assignment
-- Additive, non-breaking: existing rows keep single screenshotUrl and empty teamLeadIds.

-- ViewProof: support up to MAX_PROOF_SCREENSHOTS (5) screenshot URLs per proof.
-- screenshotUrl remains the primary (first) URL for backward compatibility.
ALTER TABLE "ViewProof" ADD COLUMN "screenshotUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Campaign: team leads assigned to a campaign may verify its proofs.
ALTER TABLE "Campaign" ADD COLUMN "teamLeadIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

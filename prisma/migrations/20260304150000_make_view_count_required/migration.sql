-- Make viewCount non-nullable with default 0 on ViewProof and Campaign tables

-- Step 1: Backfill existing NULLs
UPDATE "ViewProof" SET "viewCount" = 0 WHERE "viewCount" IS NULL;

-- Step 2: Set default and alter to NOT NULL
ALTER TABLE "ViewProof" ALTER COLUMN "viewCount" SET DEFAULT 0;
ALTER TABLE "ViewProof" ALTER COLUMN "viewCount" SET NOT NULL;

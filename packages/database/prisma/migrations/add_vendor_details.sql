-- Add enhanced vendor fields for ERP
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "gstn" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "addressLine1" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "addressLine2" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "taxNumber" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "businessPartnerType" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "sapBusinessPartnerId" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "lastSyncAt" TIMESTAMP;

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_vendors_gstn ON vendors("gstn");
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors("city");
CREATE INDEX IF NOT EXISTS idx_vendors_state ON vendors("state");

-- Add enhanced vendor fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "gstn" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "taxNumber" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "bankAccount" TEXT;

-- Add enhanced PO fields
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "fullyDelivered" BOOLEAN DEFAULT false;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS "partiallyDelivered" BOOLEAN DEFAULT false;

-- Create supplier invoices table
CREATE TABLE IF NOT EXISTS supplier_invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "invoiceNumber" TEXT NOT NULL,
    "vendorId" TEXT REFERENCES vendors(id),
    "vendorCode" TEXT,
    "invoiceDate" TIMESTAMP,
    "dueDate" TIMESTAMP,
    "amount" DECIMAL(19,4),
    "taxAmount" DECIMAL(19,4),
    "currency" TEXT DEFAULT 'INR',
    "status" TEXT DEFAULT 'pending',
    "paymentStatus" TEXT DEFAULT 'unpaid',
    "gstn" TEXT,
    "poReference" TEXT,
    "materialDocs" TEXT,
    "sapId" TEXT UNIQUE,
    "sapSyncStatus" TEXT DEFAULT 'pending',
    "sapPayload" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- CreateTable
CREATE TABLE "portal_settings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "selfRegistration" BOOLEAN NOT NULL DEFAULT true,
    "invoiceSubmission" BOOLEAN NOT NULL DEFAULT true,
    "paymentTracking" BOOLEAN NOT NULL DEFAULT true,
    "documentUpload" BOOLEAN NOT NULL DEFAULT true,
    "messaging" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "portal_settings_pkey" PRIMARY KEY ("id")
);

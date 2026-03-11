-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "email" TEXT,
    "plantCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_master" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "companyCode" TEXT,
    "supplierAcctGroup" TEXT,
    "countryName" TEXT,
    "city" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "taxNumber" TEXT,
    "postingBlock" BOOLEAN DEFAULT false,
    "purchasingBlock" BOOLEAN DEFAULT false,
    "paymentMethods" TEXT,
    "deletionFlag" BOOLEAN DEFAULT false,
    "createdBy" TEXT,
    "accountHolder" TEXT,
    "accountingClerk" TEXT,
    "accountingClerkTel" TEXT,
    "address" TEXT,
    "alternativePayee" TEXT,
    "alternativePayeeCC" TEXT,
    "authorization" TEXT,
    "automaticPO" BOOLEAN DEFAULT false,
    "bankControlKey" TEXT,
    "bankCountry" TEXT,
    "bankKey" TEXT,
    "bpBankAccount" TEXT,
    "bpPOBoxDvtgCity" TEXT,
    "bpType" TEXT,
    "branchCode" TEXT,
    "branchDescription" TEXT,
    "businessPartner" TEXT,
    "checkDoubleInvoice" BOOLEAN DEFAULT false,
    "clerkFaxNo" TEXT,
    "countryKey" TEXT,
    "createdOn" TIMESTAMP(3),
    "defaultBranch" TEXT,
    "email" TEXT,
    "faxNumber" TEXT,
    "grBasedInvVerif" BOOLEAN DEFAULT false,
    "iban" TEXT,
    "incoterms" TEXT,
    "incotermsPart2" TEXT,
    "internetAdd" TEXT,
    "itemPaymentBlock" BOOLEAN DEFAULT false,
    "liableForVAT" BOOLEAN DEFAULT true,
    "minorityIndicator" TEXT,
    "naturalPerson" BOOLEAN DEFAULT false,
    "orderCurrency" TEXT,
    "paymentBlock" BOOLEAN DEFAULT false,
    "planningGroup" TEXT,
    "postalCode" TEXT,
    "previousAccountNo" TEXT,
    "purchOrganization" TEXT,
    "purchasingGroup" TEXT,
    "reconAccount" TEXT,
    "referenceDetails" TEXT,
    "region" TEXT,
    "releaseGroup" TEXT,
    "searchTerm1" TEXT,
    "searchTerm2" TEXT,
    "sortKey" TEXT,
    "street" TEXT,
    "street2" TEXT,
    "street3" TEXT,
    "street4" TEXT,
    "street5" TEXT,
    "supplierFullName" TEXT,
    "swiftBic" TEXT,
    "taxNumber1" TEXT,
    "taxNumber2" TEXT,
    "taxNumber3" TEXT,
    "taxNumber4" TEXT,
    "taxNumber5" TEXT,
    "taxNumberAtAuth" TEXT,
    "taxNumberCategory" TEXT,
    "taxNumberType" TEXT,
    "taxType" TEXT,
    "taxTypeName" TEXT,
    "telephone1" TEXT,
    "telephone2" TEXT,
    "termsOfPaytsKeyCoCode" TEXT,
    "termsOfPaytsKeyPO" TEXT,
    "tradingPartnerNo" TEXT,
    "wTaxCRKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_credentials" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tempPassword" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTempPassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "invitationSent" BOOLEAN NOT NULL DEFAULT false,
    "invitationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "poType" TEXT,
    "plantCode" TEXT,
    "vendorId" TEXT NOT NULL,
    "poCreateDate" TIMESTAMP(3),
    "poAmendDate" TIMESTAMP(3),
    "expectedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "subtotal" DECIMAL(19,4),
    "taxAmount" DECIMAL(19,4),
    "totalAmount" DECIMAL(19,4),
    "currency" TEXT DEFAULT 'INR',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_line_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL DEFAULT 1,
    "materialCode" TEXT,
    "materialDesc" TEXT,
    "uom" TEXT,
    "quantity" DECIMAL(19,4),
    "receivedQty" DECIMAL(19,4) DEFAULT 0,
    "pendingQty" DECIMAL(19,4) DEFAULT 0,
    "unitPrice" DECIMAL(19,4),
    "discountPercent" DECIMAL(5,2) DEFAULT 0,
    "discountAmount" DECIMAL(19,4) DEFAULT 0,
    "taxableValue" DECIMAL(19,4),
    "gstPercent" DECIMAL(5,2),
    "sgstPercent" DECIMAL(5,2),
    "cgstPercent" DECIMAL(5,2),
    "igstPercent" DECIMAL(5,2),
    "gstAmount" DECIMAL(19,4),
    "totalAmount" DECIMAL(19,4),
    "expectedDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "po_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_line_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "materialCode" TEXT,
    "materialDesc" TEXT,
    "orderUnit" TEXT,
    "rate" DECIMAL(19,4),
    "invoiceQuantity" DECIMAL(19,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_upload_data" (
    "id" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "errorMessage" TEXT,
    "email" TEXT,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "plantCode" TEXT,
    "poNumber" TEXT NOT NULL,
    "poCreateDate" TIMESTAMP(3),
    "poAmendDate" TIMESTAMP(3),
    "materialCode" TEXT,
    "materialDesc" TEXT,
    "lineItem" INTEGER,
    "orderUnit" TEXT,
    "rate" DECIMAL(19,4),
    "invoiceQuantity" DECIMAL(19,4),
    "vendorId" TEXT,
    "poId" TEXT,
    "lineItemId" TEXT,

    CONSTRAINT "vendor_upload_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_invitations" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "tempPassword" TEXT NOT NULL,
    "invitationToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_supplierCode_key" ON "vendors"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_master_supplierCode_key" ON "vendor_master"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_credentials_vendorId_key" ON "vendor_credentials"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_credentials_username_key" ON "vendor_credentials"("username");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_credentials_invitationToken_key" ON "vendor_credentials"("invitationToken");

-- CreateIndex
CREATE INDEX "vendor_credentials_username_idx" ON "vendor_credentials"("username");

-- CreateIndex
CREATE INDEX "vendor_credentials_vendorId_idx" ON "vendor_credentials"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON "purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_poNumber_idx" ON "purchase_orders"("poNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_vendorId_idx" ON "purchase_orders"("vendorId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "po_line_items_purchaseOrderId_idx" ON "po_line_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_line_items_purchaseOrderId_idx" ON "purchase_order_line_items"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "vendor_upload_data_supplierCode_idx" ON "vendor_upload_data"("supplierCode");

-- CreateIndex
CREATE INDEX "vendor_upload_data_poNumber_idx" ON "vendor_upload_data"("poNumber");

-- CreateIndex
CREATE INDEX "vendor_upload_data_vendorId_idx" ON "vendor_upload_data"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_upload_data_uploadedAt_idx" ON "vendor_upload_data"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_invitations_invitationToken_key" ON "vendor_invitations"("invitationToken");

-- CreateIndex
CREATE INDEX "vendor_invitations_vendorId_idx" ON "vendor_invitations"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_invitations_invitationToken_idx" ON "vendor_invitations"("invitationToken");

-- CreateIndex
CREATE INDEX "vendor_invitations_status_idx" ON "vendor_invitations"("status");

-- AddForeignKey
ALTER TABLE "vendor_master" ADD CONSTRAINT "vendor_master_supplierCode_fkey" FOREIGN KEY ("supplierCode") REFERENCES "vendors"("supplierCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_credentials" ADD CONSTRAINT "vendor_credentials_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_line_items" ADD CONSTRAINT "po_line_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_line_items" ADD CONSTRAINT "purchase_order_line_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_upload_data" ADD CONSTRAINT "vendor_upload_data_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_upload_data" ADD CONSTRAINT "vendor_upload_data_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_upload_data" ADD CONSTRAINT "vendor_upload_data_poId_fkey" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_upload_data" ADD CONSTRAINT "vendor_upload_data_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "purchase_order_line_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_invitations" ADD CONSTRAINT "vendor_invitations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;


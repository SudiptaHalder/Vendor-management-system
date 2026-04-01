-- AlterTable
ALTER TABLE "po_line_items" ADD COLUMN     "cgstAmount" DECIMAL(19,4),
ADD COLUMN     "igstAmount" DECIMAL(19,4),
ADD COLUMN     "invoiceQuantity" DECIMAL(19,4),
ADD COLUMN     "sgstAmount" DECIMAL(19,4),
ADD COLUMN     "taxCode" TEXT,
ADD COLUMN     "totalPrice" DECIMAL(19,4);

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "plantName" TEXT,
ADD COLUMN     "subDivisionCode" TEXT;

-- CreateTable
CREATE TABLE "tax_codes" (
    "id" SERIAL NOT NULL,
    "tax_code" TEXT NOT NULL,
    "sgst_percent" DECIMAL(5,2),
    "cgst_percent" DECIMAL(5,2),
    "igst_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_division_codes" (
    "id" SERIAL NOT NULL,
    "sub_division_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_division_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_codes_tax_code_key" ON "tax_codes"("tax_code");

-- CreateIndex
CREATE UNIQUE INDEX "sub_division_codes_sub_division_code_key" ON "sub_division_codes"("sub_division_code");

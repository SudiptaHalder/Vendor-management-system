# SAP S/4HANA Cloud - Available Data Endpoints

## 1. BUSINESS PARTNER API (Vendor Master)
**Status:** ✅ Working (200 OK)

### Available Navigation Properties:
- to_BusinessPartnerAddress - Address information
- to_BusinessPartnerRole - Vendor roles
- to_BusinessPartnerTax - Tax/GSTN information
- to_BusinessPartnerBank - Bank account details
- to_BusinessPartnerContact - Contact persons
- to_EmailAddress - Email addresses
- to_PhoneNumber - Phone numbers
- to_AddressIndependentEmail - Independent emails
- to_AddressIndependentPhone - Independent phones
- to_BuPaIdentification - Identification numbers
- to_BuPaIndustry - Industry classification
- to_BusinessPartnerAlias - Alternative names
- to_BusinessPartnerRating - Vendor ratings
- to_BPEmployment - Employment information
- to_BPFiscalYearInformation - Fiscal year data

### Sample Data Fields from Main Entity:
- BusinessPartner (ID)
- BusinessPartnerName
- BusinessPartnerFullName
- OrganizationBPName1
- SearchTerm1, SearchTerm2
- AuthorizationGroup
- BusinessPartnerCategory (1=Person, 2=Organization, 3=Group)
- CreatedByUser
- CreationDate
- LastChangedByUser
- LastChangeDate
- BusinessPartnerIsBlocked

---

## 2. PURCHASE ORDER API
**Status:** ❌ 403 Forbidden (Need access)

### Available Entity Types (from metadata):
- A_PurchaseOrder
- A_PurchaseOrderItem
- A_PurchaseOrderScheduleLine
- A_PurchaseOrderAccountAssignment
- A_PurchaseOrderHeaderPartner
- A_PurchaseOrderItemPartner
- A_PurchaseOrderItemAddress

### Potential Data Fields:
- PurchaseOrder (PO number)
- SupplierCode (Vendor)
- PurchaseOrderDate
- DeliveryDate
- TotalAmount
- Currency
- PurchaseOrderStatus
- Items (Material, Quantity, Price)
- Delivery schedule lines

---

## 3. MATERIAL DOCUMENT API (Goods Receipts)
**Status:** ✅ Working (200 OK)

### Available Entities:
- A_MaterialDocumentHeader
- A_MaterialDocumentItem

### Sample Data from Header:
- MaterialDocument (Document number)
- DocumentDate
- PostingDate
- CreatedByUser
- InventoryTransactionType (WA=Goods Receipt, WE=GI, WL=Transfer)
- ReferenceDocument

### Sample Data from Items:
- Material (Material code)
- Plant
- StorageLocation
- QuantityInEntryUnit
- EntryUnit
- PurchaseOrder (Related PO)
- GoodsMovementType (561=GR, 101=GR PO)
- IsCompletelyDelivered

---

## 4. SUPPLIER INVOICE API (SOAP)
**Status:** ⚠️ SOAP endpoint exists, needs proper request format

### Expected Data:
- InvoiceNumber
- InvoiceDate
- SupplierCode
- InvoiceAmount
- TaxAmount
- PaymentTerms
- DueDate
- ReferencePO
- InvoiceItems
- TaxDetails

---

## 5. PLANT/WAREHOUSE API
**Status:** ✅ Working (200 OK from metadata)
**Endpoint:** /sap/opu/odata4/sap/api_plant_2/srvd_a2x/sap/plant/0001/

### Available Data:
- Plant (Plant code)
- PlantName
- Address details
- Storage locations
- Warehouse assignments

---

## Next Steps:

1. **Request PO API access** from SAP admin
2. **Test all navigation properties** for Business Partner
3. **Build complete ingestion for all working APIs**
4. **Document SOAP request format** for invoices

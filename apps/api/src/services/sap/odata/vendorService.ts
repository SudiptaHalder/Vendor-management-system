import { SAPAuth } from '../shared/sapAuth';
import { prisma } from '@vendor-management/database';

export class VendorService {
  private sapClient;

  constructor() {
    this.sapClient = SAPAuth.getInstance().getClient();
  }

  // Sync a single vendor by supplier code
  async syncSingleVendor(supplierCode: string): Promise<any> {
    try {
      console.log(`🔄 Syncing vendor ${supplierCode} from SAP...`);
      
      const response = await this.sapClient.get(
        `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('${supplierCode}')`,
        {
          params: {
            $format: 'json',
            $expand: [
              'to_BusinessPartnerAddress',
              'to_BusinessPartnerRole',
              'to_BusinessPartnerTax',
              'to_BusinessPartnerBank',
              'to_BusinessPartnerContact'
            ].join(',')
          }
        }
      );

      const sapVendor = response.data.d;
      
      // Extract address data
      let addressFields = {};
      if (sapVendor.to_BusinessPartnerAddress?.results?.length > 0) {
        const addr = sapVendor.to_BusinessPartnerAddress.results[0];
        addressFields = {
          addressLine1: addr.StreetName || null,
          addressLine2: addr.HouseNumber || null,
          city: addr.CityName || null,
          state: addr.Region || null,
          country: addr.Country || null,
          postalCode: addr.PostalCode || null
        };
      }

      // Extract tax data
      let taxFields = {};
      if (sapVendor.to_BusinessPartnerTax?.results?.length > 0) {
        const tax = sapVendor.to_BusinessPartnerTax.results[0];
        taxFields = {
          gstn: tax.BPTaxNumber || null,
          taxNumber: tax.BPTaxNumber || null,
          taxType: tax.BPTaxType || null
        };
      }

      const vendorData = {
        supplierCode: sapVendor.BusinessPartner,
        supplierName: sapVendor.BusinessPartnerName || sapVendor.OrganizationBPName1,
        sapCode: sapVendor.BusinessPartner,
        sapBusinessPartnerId: sapVendor.BusinessPartner,
        status: 'active',
        sapSyncStatus: 'synced',
        sapLastSyncAt: new Date(),
        sapPayload: JSON.stringify(sapVendor),
        ...addressFields,
        ...taxFields
      };

      const existingVendor = await prisma.vendors.findFirst({
        where: { supplierCode: vendorData.supplierCode }
      });

      if (existingVendor) {
        await prisma.vendors.update({
          where: { id: existingVendor.id },
          data: vendorData
        });
      } else {
        await prisma.vendors.create({
          data: vendorData
        });
      }

      return { success: true, vendor: vendorData };
    } catch (error) {
      console.error(`Failed to sync vendor ${supplierCode}:`, error.message);
      throw error;
    }
  }

  // Sync all vendors by fetching from database and updating individually
  async syncVendorsFromSAP(): Promise<any> {
    let synced = 0;
    let failed = 0;

    try {
      // Get all vendor codes from database (from your existing CSV import)
      const existingVendors = await prisma.vendors.findMany({
        select: { supplierCode: true }
      });

      console.log(`📊 Found ${existingVendors.length} vendors to sync from database`);

      for (const vendor of existingVendors) {
        try {
          await this.syncSingleVendor(vendor.supplierCode);
          synced++;
          console.log(`✅ Synced ${synced}/${existingVendors.length}: ${vendor.supplierCode}`);
        } catch (error) {
          failed++;
          console.error(`❌ Failed to sync ${vendor.supplierCode}`);
        }
      }

      console.log(`✅ Vendor sync complete: ${synced} synced, ${failed} failed`);
      return { synced, failed, total: existingVendors.length };
    } catch (error) {
      console.error('Error syncing vendors from SAP:', error);
      throw error;
    }
  }

  async getVendorById(id: string): Promise<any> {
    return await prisma.vendors.findUnique({
      where: { id },
      include: { purchaseOrders: true }
    });
  }

  async getVendorMetrics(): Promise<any> {
    const totalVendors = await prisma.vendors.count();
    const activeVendors = await prisma.vendors.count({ where: { status: 'active' } });
    const pendingVendors = await prisma.vendors.count({ where: { status: 'pending' } });
    const syncedVendors = await prisma.vendors.count({ where: { sapSyncStatus: 'synced' } });
    
    let vendorsWithGSTN = 0;
    try {
      const result = await prisma.$queryRaw`SELECT COUNT(*) FROM vendors WHERE "gstn" IS NOT NULL AND "gstn" != ''`;
      vendorsWithGSTN = Number(result[0]?.count) || 0;
    } catch (e) {
      vendorsWithGSTN = 0;
    }

    return { totalVendors, activeVendors, pendingVendors, syncedVendors, vendorsWithGSTN };
  }

  async searchVendors(searchTerm: string, filters?: any): Promise<any[]> {
    const where: any = {};

    if (searchTerm) {
      where.OR = [
        { supplierCode: { contains: searchTerm, mode: 'insensitive' } },
        { supplierName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
        { gstn: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return await prisma.vendors.findMany({
      where,
      orderBy: { supplierName: 'asc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });
  }
}

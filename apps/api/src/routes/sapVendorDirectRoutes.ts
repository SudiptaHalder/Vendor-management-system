import { Router } from 'express';
import { prisma } from '@vendor-management/database';
import { authMiddleware } from '../middleware/auth.middleware';
import { VendorDetailService } from '../services/sap/vendorDetailService';
import { SAPAuth } from '../services/sap/shared/sapAuth';
const router = Router();

// Get complete vendor details
router.get('/vendors/complete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // The route param is our local vendor id (cuid), but SAP's Business Partner
    // key is the sapCode/sapBusinessPartnerId - resolve it before calling SAP.
    const vendor = await prisma.vendors.findUnique({
      where: { id },
      select: { sapBusinessPartnerId: true, sapCode: true }
    });

    const businessPartnerId = vendor?.sapBusinessPartnerId || vendor?.sapCode || id;

    const service = new VendorDetailService();
    const result = await service.getVendorDetailsWithRawData(businessPartnerId);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vendor details'
    });
  }
});

// Get vendor list (simple)
router.get('/vendors', authMiddleware, async (req, res) => {
  try {
    const { limit = 200, search = '' } = req.query;
    const sapAuth = SAPAuth.getInstance();
    const client = sapAuth.getClient();

    let filter = "BusinessPartnerCategory eq '2'";
    if (search) {
      filter += ` and (contains(BusinessPartnerName, '${search}') or contains(BusinessPartner, '${search}'))`;
    }

    const response = await client.get(
      '/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner',
      {
        params: {
          $format: 'json',
          $top: parseInt(limit as string),
          $filter: filter,
          $expand: 'to_BusinessPartnerAddress,to_BusinessPartnerAddress/to_EmailAddress,to_BusinessPartnerTax',
          $orderby: 'BusinessPartnerName asc'
        }
      }
    );

    const vendors = response.data.d?.results || [];
    
    const transformedVendors = vendors.map((vendor: any) => {
      const address = vendor.to_BusinessPartnerAddress?.results?.[0];
      const emails = address?.to_EmailAddress?.results || [];
      const defaultEmail = emails.find((e: any) => e.IsDefaultEmailAddress === true) || emails[0];
      return {
        BusinessPartner: vendor.BusinessPartner,
        BusinessPartnerName: vendor.BusinessPartnerName || vendor.OrganizationBPName1,
        CityName: address?.CityName || null,
        Country: address?.Country || null,
        EmailAddress: defaultEmail?.EmailAddress || null,
        TaxNumber: vendor.to_BusinessPartnerTax?.results?.[0]?.BPTaxNumber || vendor.TaxNumber || null,
        CreatedByUser: vendor.CreatedByUser,
        CreationDate: vendor.CreationDate
      };
    });

    res.json({
      success: true,
      data: transformedVendors,
      source: 'SAP Live',
      count: transformedVendors.length
    });
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch vendors'
    });
  }
});

export default router;

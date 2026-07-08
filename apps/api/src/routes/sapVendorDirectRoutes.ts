import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { VendorDetailService } from '../services/sap/vendorDetailService';

const router = Router();

// Get complete vendor details
router.get('/vendors/complete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const service = new VendorDetailService();
    const result = await service.getVendorDetailsWithRawData(id);
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
          $expand: 'to_BusinessPartnerAddress,to_BusinessPartnerTax',
          $orderby: 'BusinessPartnerName asc'
        }
      }
    );

    const vendors = response.data.d?.results || [];
    
    const transformedVendors = vendors.map((vendor: any) => ({
      BusinessPartner: vendor.BusinessPartner,
      BusinessPartnerName: vendor.BusinessPartnerName || vendor.OrganizationBPName1,
      CityName: vendor.to_BusinessPartnerAddress?.results?.[0]?.CityName || null,
      Country: vendor.to_BusinessPartnerAddress?.results?.[0]?.Country || null,
      TaxNumber: vendor.to_BusinessPartnerTax?.results?.[0]?.BPTaxNumber || vendor.TaxNumber || null,
      CreatedByUser: vendor.CreatedByUser,
      CreationDate: vendor.CreationDate
    }));

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

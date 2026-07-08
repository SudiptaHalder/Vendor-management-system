import { SAPAuth } from './sapAuth';

export interface VendorDetail {
  BusinessPartner: string;
  VendorCode: string;
  VendorName: string;
  GSTN: string | null;
  TaxNumber: string | null;
  Email: string | null;
  Phone: string | null;
  InternationalPhone: string | null;
  AddressLine1: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  PostalCode: string | null;
  Roles: string[];
  CreatedByUser: string;
  CreationDate: string;
}

export class VendorDetailService {
  private sapClient;

  constructor() {
    this.sapClient = SAPAuth.getInstance().getClient();
  }

  async getVendorDetails(vendorId: string): Promise<VendorDetail> {
    console.log(`🔍 Fetching complete vendor details for: ${vendorId}`);
    
    // 1. Fetch Business Partner
    const bpResponse = await this.sapClient.get(
      `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('${vendorId}')`,
      {
        params: {
          $format: 'json',
          $expand: 'to_BusinessPartnerAddress,to_BusinessPartnerTax,to_BusinessPartnerRole'
        }
      }
    );

    const bp = bpResponse.data.d;
    
    if (!bp) {
      throw new Error(`Business Partner ${vendorId} not found`);
    }

    // Extract basic info
    const result: VendorDetail = {
      BusinessPartner: bp.BusinessPartner,
      VendorCode: bp.BusinessPartner,
      VendorName: bp.BusinessPartnerName || bp.OrganizationBPName1 || 'Unknown',
      GSTN: null,
      TaxNumber: null,
      Email: null,
      Phone: null,
      InternationalPhone: null,
      AddressLine1: null,
      City: null,
      State: null,
      Country: null,
      PostalCode: null,
      Roles: [],
      CreatedByUser: bp.CreatedByUser || '',
      CreationDate: bp.CreationDate || ''
    };

    // 2. Extract Tax Information
    if (bp.to_BusinessPartnerTax?.results?.length > 0) {
      const tax = bp.to_BusinessPartnerTax.results[0];
      result.GSTN = tax.BPTaxNumber || null;
      result.TaxNumber = tax.BPTaxNumber || null;
    }

    // 3. Extract Roles
    if (bp.to_BusinessPartnerRole?.results?.length > 0) {
      result.Roles = bp.to_BusinessPartnerRole.results.map((r: any) => r.BusinessPartnerRole);
    }

    // 4. Extract Address and Communication from Address entities
    if (bp.to_BusinessPartnerAddress?.results?.length > 0) {
      const address = bp.to_BusinessPartnerAddress.results[0];
      const addressId = address.AddressID;
      
      // Address fields
      result.AddressLine1 = address.StreetName || address.StreetPrefixName || null;
      result.City = address.CityName || null;
      result.State = address.Region || null;
      result.Country = address.Country || null;
      result.PostalCode = address.PostalCode || null;

      // 4a. Fetch Email Address from Address
      try {
        const emailResponse = await this.sapClient.get(
          `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartnerAddress(BusinessPartner='${vendorId}',AddressID='${addressId}')/to_EmailAddress`,
          { params: { $format: 'json' } }
        );
        
        const emails = emailResponse.data.d?.results || [];
        const defaultEmail = emails.find((e: any) => e.IsDefaultEmailAddress === true);
        if (defaultEmail) {
          result.Email = defaultEmail.EmailAddress;
        } else if (emails.length > 0) {
          result.Email = emails[0].EmailAddress;
        }
      } catch (error) {
        console.log(`No email found for vendor ${vendorId}`);
      }

      // 4b. Fetch Phone Numbers from Address
      try {
        const phoneResponse = await this.sapClient.get(
          `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartnerAddress(BusinessPartner='${vendorId}',AddressID='${addressId}')/to_PhoneNumber`,
          { params: { $format: 'json' } }
        );
        
        const phones = phoneResponse.data.d?.results || [];
        const defaultPhone = phones.find((p: any) => p.IsDefaultPhoneNumber === true);
        if (defaultPhone) {
          result.Phone = defaultPhone.PhoneNumber;
          result.InternationalPhone = defaultPhone.InternationalPhoneNumber || null;
        } else if (phones.length > 0) {
          result.Phone = phones[0].PhoneNumber;
          result.InternationalPhone = phones[0].InternationalPhoneNumber || null;
        }
      } catch (error) {
        console.log(`No phone found for vendor ${vendorId}`);
      }

      // 4c. Also try Mobile Phone (if needed)
      try {
        const mobileResponse = await this.sapClient.get(
          `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartnerAddress(BusinessPartner='${vendorId}',AddressID='${addressId}')/to_MobilePhoneNumber`,
          { params: { $format: 'json' } }
        );
        
        const mobiles = mobileResponse.data.d?.results || [];
        // Only use mobile if we don't have a phone already
        if (!result.Phone && mobiles.length > 0) {
          const defaultMobile = mobiles.find((m: any) => m.IsDefaultPhoneNumber === true);
          if (defaultMobile) {
            result.Phone = defaultMobile.PhoneNumber;
            result.InternationalPhone = defaultMobile.InternationalPhoneNumber || null;
          } else if (mobiles.length > 0) {
            result.Phone = mobiles[0].PhoneNumber;
            result.InternationalPhone = mobiles[0].InternationalPhoneNumber || null;
          }
        }
      } catch (error) {
        // Mobile phone might not be available
      }
    }

    return result;
  }

  async getVendorDetailsWithRawData(vendorId: string): Promise<any> {
    const vendor = await this.getVendorDetails(vendorId);
    return {
      success: true,
      data: vendor,
      source: 'SAP Business Partner API (Complete)',
      dataQuality: {
        hasContact: !!(vendor.Email || vendor.Phone),
        hasAddress: !!(vendor.City || vendor.AddressLine1),
        hasTax: !!(vendor.GSTN || vendor.TaxNumber)
      }
    };
  }
}

import { SAPAuth } from '../shared/sapAuth';

// All 44+ navigation properties for maximum data extraction
const ALL_NAVIGATION_PROPERTIES = [
  'to_BusinessPartnerAddress',
  'to_BusinessPartnerRole',
  'to_BusinessPartnerTax',
  'to_BusinessPartnerBank',
  'to_BusinessPartnerContact',
  'to_EmailAddress',
  'to_PhoneNumber',
  'to_FaxNumber',
  'to_MobilePhoneNumber',
  'to_URLAddress',
  'to_AddressIndependentEmail',
  'to_AddressIndependentPhone',
  'to_AddressIndependentFax',
  'to_AddressIndependentMobile',
  'to_AddressIndependentWebsite',
  'to_BuPaIdentification',
  'to_BuPaIndustry',
  'to_BusinessPartnerAlias',
  'to_BusinessPartnerRating',
  'to_BPCreditWorthiness',
  'to_BPDataController',
  'to_BPEmployment',
  'to_BPFinServicesReporting',
  'to_BPFiscalYearInformation',
  'to_BPRelationship',
  'to_BusinessPartnerIsBank',
  'to_PartnerFunction',
  'to_PaymentCard',
  'to_WithHoldingTax',
  'to_CompanyText',
  'to_ContactAddress',
  'to_ContactRelationship',
  'to_Customer',
  'to_Supplier'
];

export class MaxVendorExtractor {
  private sapClient;

  constructor() {
    this.sapClient = SAPAuth.getInstance().getClient();
  }

  async extractCompleteVendorData(vendorId: string): Promise<any> {
    console.log(`🔍 Extracting MAXIMUM data for vendor: ${vendorId}`);
    
    const expandParam = ALL_NAVIGATION_PROPERTIES.join(',');
    
    const response = await this.sapClient.get(
      `/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('${vendorId}')`,
      {
        params: {
          $format: 'json',
          $expand: expandParam
        }
      }
    );
    
    const data = response.data.d;
    
    // Report what data was found
    const foundProps = ALL_NAVIGATION_PROPERTIES.filter(prop => {
      const propData = data[prop];
      return propData && propData.results && propData.results.length > 0;
    });
    
    console.log(`✅ Found data in ${foundProps.length} out of ${ALL_NAVIGATION_PROPERTIES.length} navigation properties`);
    console.log('Properties with data:', foundProps);
    
    return data;
  }
}

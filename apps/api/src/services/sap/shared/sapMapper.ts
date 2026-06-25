export class SAPMapper {
  
  static mapBusinessPartnerToVendor(sapData: any): any {
    const vendor = {
      supplierCode: sapData.BusinessPartner,
      supplierName: sapData.BusinessPartnerName || sapData.OrganizationBPName1,
      sapCode: sapData.BusinessPartner,
      sapBusinessPartnerId: sapData.BusinessPartner,
      businessPartnerType: sapData.BusinessPartnerCategory,
      status: sapData.AuthorizationGroup === '0001' ? 'active' : 'pending',
      sapSyncStatus: 'synced',
      sapLastSyncAt: new Date(),
      sapPayload: JSON.stringify(sapData)
    };

    // Map address if available
    if (sapData.to_BusinessPartnerAddress?.results?.length > 0) {
      const address = sapData.to_BusinessPartnerAddress.results[0];
      vendor.addressLine1 = address.StreetName || null;
      vendor.addressLine2 = address.HouseNumber || null;
      vendor.city = address.CityName || null;
      vendor.state = address.Region || null;
      vendor.country = address.Country || null;
      vendor.postalCode = address.PostalCode || null;
    }

    // Map tax details if available
    if (sapData.to_BusinessPartnerTax?.results?.length > 0) {
      const tax = sapData.to_BusinessPartnerTax.results[0];
      vendor.gstn = tax.TaxNumber || null;
      vendor.taxNumber = tax.TaxNumber || null;
    }

    // Map contact info
    vendor.contactName = sapData.BusinessPartnerFullName || sapData.BusinessPartnerName;
    vendor.email = sapData.EmailAddress || null;
    vendor.phone = sapData.PhoneNumber || null;

    return vendor;
  }

  static mapVendorToResponse(vendor: any): any {
    return {
      id: vendor.id,
      supplierCode: vendor.supplierCode,
      supplierName: vendor.supplierName,
      gstn: vendor.gstn,
      contactName: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      addressLine1: vendor.addressLine1,
      addressLine2: vendor.addressLine2,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      postalCode: vendor.postalCode,
      taxNumber: vendor.taxNumber,
      status: vendor.status,
      sapSyncStatus: vendor.sapSyncStatus,
      sapLastSyncAt: vendor.sapLastSyncAt,
      createdAt: vendor.createdAt,
      businessPartnerType: vendor.businessPartnerType
    };
  }
}

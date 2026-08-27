'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Building2, Search, RefreshCw, Eye, MapPin, Mail, Phone, CreditCard, Users, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Vendor {
  id: string;
  supplierCode: string;
  supplierName: string;
  gstn: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  sapSyncStatus: string;
}

interface Metrics {
  totalVendors: number;
  activeVendors: number;
  vendorsWithGSTN: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalVendors: 0, activeVendors: 0, vendorsWithGSTN: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchVendorsFromSAP = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      setRefreshing(true);
      setError('');

      // First, get the total count from SAP
      const countRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/vendors/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const countData = await countRes.json();
      const totalCount = countData.success ? countData.data?.count || 0 : 0;

      // Then fetch the vendors (limit 200 for display)
      const url = searchTerm 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/vendors/search?term=${encodeURIComponent(searchTerm)}&limit=200`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/vendors?limit=200`;
      
      const vendorsRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vendorsData = await vendorsRes.json();
      
      if (vendorsData.success && vendorsData.data) {
        // Transform SAP data to match our interface
        const processedVendors = vendorsData.data.map((vendor: any) => ({
          id: vendor.BusinessPartner || vendor.supplierCode || vendor.id,
          supplierCode: vendor.BusinessPartner || vendor.supplierCode,
          supplierName: vendor.BusinessPartnerName || vendor.supplierName || vendor.OrganizationBPName1 || vendor.name || 'Unknown',
          gstn: vendor.TaxNumber || vendor.gstn || null,
          contactName: vendor.BusinessPartnerFullName || vendor.contactName || null,
          email: vendor.EmailAddress || vendor.email || null,
          phone: vendor.PhoneNumber || vendor.phone || null,
          city: vendor.CityName || vendor.city || null,
          state: vendor.Region || vendor.state || null,
          status: vendor.AuthorizationGroup === '0001' ? 'active' : 'pending',
          sapSyncStatus: 'synced'
        }));
        setVendors(processedVendors);
        
        // Update metrics with TOTAL count from SAP
        setMetrics({
          totalVendors: totalCount || processedVendors.length,
          activeVendors: processedVendors.filter((v: any) => v.status === 'active').length,
          vendorsWithGSTN: processedVendors.filter((v: any) => v.gstn).length
        });
      } else {
        setError(vendorsData.error || 'Failed to fetch vendors from SAP');
      }
    } catch (err: any) {
      console.error('Error fetching vendors from SAP:', err);
      setError(err.message || 'Failed to connect to SAP');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendorsFromSAP();
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600">Live Vendor Master Data from SAP S/4HANA</p>
              <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <Zap size={12} className="mr-1" />
                SAP Live
              </span>
            </div>
          </div>
          <button
            onClick={fetchVendorsFromSAP}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh from SAP'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">SAP Connection Error</p>
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchVendorsFromSAP}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Metrics Cards - Showing TOTAL SAP count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold">{metrics.totalVendors.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">✓ Live from SAP</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeVendors.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">✓ Live from SAP</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vendors with GSTN</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.vendorsWithGSTN}</p>
                <p className="text-xs text-gray-500 mt-1">From SAP data</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors in SAP by name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GSTN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No vendors found in SAP. Click "Refresh from SAP" to fetch vendors.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.supplierCode || vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{vendor.supplierName}</p>
                          <p className="text-sm text-gray-500">Code: {vendor.supplierCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono">{vendor.gstn || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {vendor.contactName && (
                            <p className="text-sm text-gray-900">{vendor.contactName}</p>
                          )}
                          {vendor.email && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Mail size={12} />
                              <span>{vendor.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.city && (
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{vendor.city}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/vendors/${vendor.supplierCode}`}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SAP Connection Status */}
        <div className={`rounded-lg p-4 flex items-center justify-between ${
          error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              error ? 'bg-red-500' : 'bg-green-500'
            }`}></div>
            <div>
              <p className={`text-sm font-medium ${
                error ? 'text-red-800' : 'text-green-800'
              }`}>
                {error ? 'SAP Connection Issue' : 'Connected to SAP S/4HANA Cloud'}
              </p>
              <p className={`text-xs ${
                error ? 'text-red-700' : 'text-green-700'
              }`}>
                {error ? 'Failed to fetch vendor data' : `Showing ${vendors.length} of ${metrics.totalVendors} vendors from SAP Business Partner API`}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {metrics.totalVendors > 0 ? `${metrics.totalVendors.toLocaleString()} total vendors` : 'No vendors loaded'}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

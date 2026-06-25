'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Building2, Search, RefreshCw, Eye, MapPin, Mail, Phone, CreditCard, Users } from 'lucide-react';
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
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      // Fetch vendors
      const url = searchTerm 
        ? `http://localhost:3001/api/erp/vendors/search/${encodeURIComponent(searchTerm)}`
        : 'http://localhost:3001/api/erp/vendors?limit=100';
      
      const vendorsRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vendorsData = await vendorsRes.json();
      
      if (vendorsData.success) {
        setVendors(vendorsData.data || []);
      }

      // Fetch metrics
      const metricsRes = await fetch('http://localhost:3001/api/erp/vendor-metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics({
        totalVendors: metricsData.totalVendors || 0,
        activeVendors: metricsData.activeVendors || 0,
        vendorsWithGSTN: metricsData.vendorsWithGSTN || 0
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncVendors = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/api/erp/sync-vendors', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchData();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
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
            <p className="text-gray-600 mt-1">ERP Vendor Master Data from SAP S/4HANA</p>
          </div>
          <button
            onClick={syncVendors}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync with SAP'}</span>
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold">{metrics.totalVendors}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeVendors}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vendors with GSTN</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.vendorsWithGSTN}</p>
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
            placeholder="Search by name, code, GSTN, email, or contact person..."
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
                      No vendors found. Click "Sync with SAP" to import vendors.
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
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
                          href={`/vendors/${vendor.id}`}
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
      </div>
    </MainLayout>
  );
}

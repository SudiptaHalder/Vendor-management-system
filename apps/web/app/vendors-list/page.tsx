'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Building2, Search, Filter, RefreshCw, Eye, MapPin, Mail, Phone, CreditCard } from 'lucide-react';
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
  sapLastSyncAt: string;
}

export default function VendorsListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      const url = searchTerm 
        ? `http://localhost:3001/api/erp/vendors/search/${searchTerm}`
        : `http://localhost:3001/api/erp/vendors?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
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
      await fetchVendors();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSyncBadge = (status: string) => {
    return status === 'synced' 
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-bold text-gray-900">Vendors Directory</h1>
            <p className="text-gray-600 mt-1">ERP Vendor Master Data from SAP S/4HANA</p>
          </div>
          <button
            onClick={syncVendors}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync with SAP'}</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, GSTN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SAP Sync</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{vendor.supplierName}</p>
                        <p className="text-sm text-gray-500">Code: {vendor.supplierCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{vendor.gstn || '-'}</span>
                      </div>
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
                        {vendor.phone && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Phone size={12} />
                            <span>{vendor.phone}</span>
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
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSyncBadge(vendor.sapSyncStatus)}`}>
                        {vendor.sapSyncStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/vendors-list/${vendor.id}`}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

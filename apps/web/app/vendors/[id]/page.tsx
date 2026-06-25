'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Building2, Mail, Phone, MapPin, CreditCard, RefreshCw, ArrowLeft, 
  Calendar, Database, CheckCircle, Clock, FileText, Package 
} from 'lucide-react';
import Link from 'next/link';

interface VendorDetail {
  id: string;
  supplierCode: string;
  supplierName: string;
  gstn: string;
  contactName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  status: string;
  sapSyncStatus: string;
  sapLastSyncAt: string;
  createdAt: string;
  businessPartnerType: string;
}

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchVendor = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      const response = await fetch(`http://localhost:3001/api/erp/vendors/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setVendor(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncVendor = async () => {
    if (!vendor) return;
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/erp/sync-vendors/${vendor.supplierCode}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchVendor();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!vendor) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Vendor not found</p>
          <Link href="/vendors" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Vendors
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/vendors" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.supplierName}</h1>
              <p className="text-gray-600 mt-1">Vendor Code: {vendor.supplierCode}</p>
            </div>
          </div>
          <button
            onClick={syncVendor}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync with SAP'}</span>
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold capitalize">{vendor.status}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">SAP Sync</p>
                <p className="text-lg font-semibold capitalize">{vendor.sapSyncStatus}</p>
              </div>
              <Database className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="text-lg font-semibold">{vendor.businessPartnerType || 'Supplier'}</p>
              </div>
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-orange-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-lg font-semibold">{new Date(vendor.createdAt).toLocaleDateString()}</p>
              </div>
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="text-gray-900">{vendor.contactName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-gray-400" />
                  <p className="text-gray-900">{vendor.email || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-gray-400" />
                  <p className="text-gray-900">{vendor.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Tax Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">GSTN</p>
                <p className="text-gray-900 font-mono">{vendor.gstn || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax Number</p>
                <p className="text-gray-900">{vendor.taxNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Address Line 1</p>
                <p className="text-gray-900">{vendor.addressLine1 || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address Line 2</p>
                <p className="text-gray-900">{vendor.addressLine2 || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-gray-900">{vendor.city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-gray-900">{vendor.state || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="text-gray-900">{vendor.country || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Postal Code</p>
                <p className="text-gray-900">{vendor.postalCode || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SAP Integration Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-orange-600" />
            SAP Integration Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Sync Time</p>
              <p className="text-gray-900">
                {vendor.sapLastSyncAt ? new Date(vendor.sapLastSyncAt).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SAP Business Partner ID</p>
              <p className="text-gray-900 font-mono">{vendor.supplierCode}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

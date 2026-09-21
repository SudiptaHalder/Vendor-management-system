
'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Building2, Mail, Phone, MapPin, CreditCard, RefreshCw, ArrowLeft, 
  Calendar, Database, CheckCircle, Clock, AlertCircle, Zap, User, Info
} from 'lucide-react';
import Link from 'next/link';

interface VendorData {
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

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendor = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      setRefreshing(true);
      setError('');

      // Use the correct API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/vendors/complete/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setVendor(data.data);
      } else {
        setError(data.error || 'Vendor not found');
      }
    } catch (err: any) {
      console.error('Error fetching vendor:', err);
      setError(err.message || 'Failed to fetch vendor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchVendor();
    }
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

  if (error || !vendor) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error || 'Vendor not found'}</p>
          <Link href="/vendors" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
            Back to Vendors
          </Link>
        </div>
      </MainLayout>
    );
  }

  const hasContact = !!(vendor.Email || vendor.Phone);
  const hasAddress = !!(vendor.City || vendor.AddressLine1);
  const hasTax = !!(vendor.GSTN || vendor.TaxNumber);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/vendors" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vendor.VendorName}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-gray-600 dark:text-gray-400">Vendor Code: {vendor.VendorCode}</p>
                <span className="flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                  <Zap size={12} className="mr-1" />
                  SAP Live
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchVendor}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh from SAP'}</span>
          </button>
        </div>

        {/* Data Quality Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-lg p-3 flex items-center space-x-2 ${hasContact ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
            <User className={`w-4 h-4 ${hasContact ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm ${hasContact ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {hasContact ? '✓ Contact available' : 'No contact in SAP'}
            </span>
          </div>
          <div className={`rounded-lg p-3 flex items-center space-x-2 ${hasAddress ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
            <MapPin className={`w-4 h-4 ${hasAddress ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm ${hasAddress ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {hasAddress ? '✓ Address available' : 'No address in SAP'}
            </span>
          </div>
          <div className={`rounded-lg p-3 flex items-center space-x-2 ${hasTax ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
            <CreditCard className={`w-4 h-4 ${hasTax ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm ${hasTax ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {hasTax ? '✓ Tax info available' : 'No tax info in SAP'}
            </span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold capitalize">Active</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">SAP Sync</p>
                <p className="text-lg font-semibold capitalize">Synced</p>
              </div>
              <Database className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Business Type</p>
                <p className="text-lg font-semibold">Supplier</p>
              </div>
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border-l-4 border-orange-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-lg font-semibold">
                  {vendor.CreationDate ? new Date(vendor.CreationDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-900 dark:text-gray-100">{vendor.Email || 'Not available'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-900 dark:text-gray-100">{vendor.Phone || 'Not available'}</p>
                </div>
                {vendor.InternationalPhone && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">International: {vendor.InternationalPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Tax Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">GSTN</p>
                <p className="text-gray-900 dark:text-gray-100 font-mono">{vendor.GSTN || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tax Number</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.TaxNumber || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Address Line</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.AddressLine1 || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.City || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">State</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.State || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.Country || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Postal Code</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.PostalCode || 'Not available'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        {vendor.Roles && vendor.Roles.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SAP Roles</h2>
            <div className="flex flex-wrap gap-2">
              {vendor.Roles.map((role, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SAP Integration Status */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            SAP Integration Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">SAP Business Partner ID</p>
              <p className="text-gray-900 dark:text-gray-100 font-mono">{vendor.VendorCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data Source</p>
              <p className="text-gray-900 dark:text-gray-100 text-green-600 dark:text-green-400">✓ Live from SAP S/4HANA</p>
            </div>
            {vendor.CreatedByUser && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                <p className="text-gray-900 dark:text-gray-100">{vendor.CreatedByUser}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


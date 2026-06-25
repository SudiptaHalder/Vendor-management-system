'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Database, 
  Building2, 
  Package, 
  FileText, 
  RefreshCw, 
  Search, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  Users,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  List,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface Vendor {
  id: string;
  supplierCode: string;
  supplierName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  gstn: string;
  status: string;
  sapSyncStatus: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: {
    supplierCode: string;
    supplierName: string;
  };
  poCreateDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  lineItems: any[];
  createdAt: string;
}

interface MaterialDocument {
  id: string;
  sapId: string;
  documentNumber: string;
  documentDate: string;
  postingDate: string;
  companyCode: string;
  plant: string;
  materialCode: string;
  quantity: number;
  unit: string;
  amount: number;
  currency: string;
}

interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  totalPOs: number;
  openPOs: number;
  totalMaterialDocs: number;
  syncedVendors: number;
  vendorsWithGSTN: number;
}

export default function SAPDataExplorer() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'purchase-orders' | 'material-documents' | 'overview'>('overview');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [materialDocs, setMaterialDocs] = useState<MaterialDocument[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeVendors: 0,
    totalPOs: 0,
    openPOs: 0,
    totalMaterialDocs: 0,
    syncedVendors: 0,
    vendorsWithGSTN: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vendors: true,
    purchaseOrders: true,
    materialDocs: true
  });

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      setRefreshing(true);
      setError('');

      // Fetch vendors
      const vendorsRes = await fetch('http://localhost:3001/api/erp/vendors?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vendorsData = await vendorsRes.json();
      if (vendorsData.success) {
        setVendors(vendorsData.data || []);
      }

      // Fetch purchase orders
      const poRes = await fetch('http://localhost:3001/api/purchase-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const poData = await poRes.json();
      if (poData.success) {
        setPurchaseOrders(poData.data || []);
      }

      // Fetch material documents
      const docsRes = await fetch('http://localhost:3001/api/sap/material-documents?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docsData = await docsRes.json();
      if (docsData.success) {
        setMaterialDocs(docsData.data || []);
      }

      // Fetch metrics
      const metricsRes = await fetch('http://localhost:3001/api/erp/vendor-metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();

      setStats({
        totalVendors: vendorsData.data?.length || 0,
        activeVendors: metricsData.activeVendors || 0,
        totalPOs: poData.data?.length || 0,
        openPOs: poData.data?.filter((p: any) => p.status === 'open').length || 0,
        totalMaterialDocs: docsData.data?.length || 0,
        syncedVendors: metricsData.syncedVendors || 0,
        vendorsWithGSTN: metricsData.vendorsWithGSTN || 0
      });

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-red-100 text-red-800',
      'open': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-teal-100 text-teal-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredVendors = vendors.filter(v => 
    v.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPOs = purchaseOrders.filter(p => 
    p.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = materialDocs.filter(d => 
    d.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.materialCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading SAP data...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600" />
              SAP Data Explorer
            </h1>
            <p className="text-gray-600 mt-1">Complete view of all data synced from SAP S/4HANA</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh All'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Error: {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalVendors.toLocaleString()}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.activeVendors} active</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Purchase Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPOs.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.openPOs} open</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Material Documents</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalMaterialDocs.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">SAP Sync Status</p>
                <p className="text-2xl font-bold text-orange-600">{stats.syncedVendors.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">vendors synced</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search across all SAP data (vendors, POs, material documents)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vendors Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
            onClick={() => toggleSection('vendors')}
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Vendors ({filteredVendors.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {vendors.length} total
              </span>
              {expandedSections.vendors ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.vendors && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GSTN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sync</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVendors.slice(0, 20).map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vendor.supplierCode}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {vendor.supplierName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {vendor.gstn || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {vendor.city || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(vendor.sapSyncStatus || 'pending')}`}>
                          {vendor.sapSyncStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVendors.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                  Showing 20 of {filteredVendors.length} vendors
                </div>
              )}
            </div>
          )}
        </div>

        {/* Purchase Orders Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
            onClick={() => toggleSection('purchaseOrders')}
          >
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Purchase Orders ({filteredPOs.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {purchaseOrders.length} total
              </span>
              {expandedSections.purchaseOrders ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.purchaseOrders && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPOs.slice(0, 20).map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {po.poNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {po.vendor?.supplierName || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {po.poCreateDate ? new Date(po.poCreateDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {po.totalAmount} {po.currency || 'INR'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {po.lineItems?.length || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/procurement/purchase-orders/${po.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPOs.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                  Showing 20 of {filteredPOs.length} purchase orders
                </div>
              )}
            </div>
          )}
        </div>

        {/* Material Documents Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition"
            onClick={() => toggleSection('materialDocs')}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Material Documents ({filteredDocs.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {materialDocs.length} total
              </span>
              {expandedSections.materialDocs ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.materialDocs && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SAP ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocs.slice(0, 20).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {doc.documentNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {doc.materialCode || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {doc.quantity} {doc.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {doc.plant || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {doc.amount} {doc.currency || 'INR'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {doc.sapId?.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocs.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                  Showing 20 of {filteredDocs.length} material documents
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          Showing all SAP data synced from S/4HANA Cloud • 
          {vendors.length} vendors • {purchaseOrders.length} purchase orders • {materialDocs.length} material documents
        </div>
      </div>
    </MainLayout>
  );
}

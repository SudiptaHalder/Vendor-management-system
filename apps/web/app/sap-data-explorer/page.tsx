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
  poNumber: string;
  supplierCode: string;
  supplierName: string;
  poCreateDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  lineItems: any[];
}

// Mirrors the mapping used server-side in sap-purchase-orders.routes.ts -
// SAP's PurchaseOrderStatus is a numeric processing code, not a plain string.
function mapSAPPOStatus(status: string): string {
  const statusMap: Record<string, string> = {
    '1': 'pending',
    '2': 'approved',
    '3': 'approved',
    '4': 'completed',
    '5': 'cancelled',
    '6': 'completed'
  };
  return statusMap[status] || status || 'pending';
}

// SAP OData V2 dates come as "/Date(1712448000000)/", not a plain ISO
// string - new Date() on that raw string produces "Invalid Date".
function parseSAPDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /\/Date\((\d+)\)\//.exec(value);
  if (match) return new Date(parseInt(match[1], 10));
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
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
      const vendorsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/vendors?limit=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vendorsData = await vendorsRes.json();
      if (vendorsData.success) {
        setVendors(vendorsData.data || []);
      }

      // Fetch purchase orders - live from SAP, not the local DB cache
      const poRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/purchase-orders?limit=200`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const poData = await poRes.json();
      if (poData.success) {
        setPurchaseOrders((poData.data || []).map((o: any) => ({
          poNumber: o.PurchaseOrder,
          supplierCode: o.Supplier,
          supplierName: o.SupplierName || o.Supplier,
          poCreateDate: o.PurchaseOrderDate,
          totalAmount: o.TotalAmount || 0,
          currency: o.DocumentCurrency || 'INR',
          status: mapSAPPOStatus(o.PurchaseOrderStatus),
          lineItems: o.to_PurchaseOrderItem?.results || []
        })));
      }

      // Fetch material documents
      const docsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/material-documents?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docsData = await docsRes.json();
      if (docsData.success) {
        setMaterialDocs(docsData.data || []);
      }

      // Fetch metrics
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/vendor-metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();

      // True live SAP totals (uncapped) - the .length checks below only count
      // the fetched page (limit=200/100 above), not the real total counts.
      const [vendorCountRes, poCountRes, docCountRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/vendors/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/purchase-orders/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sap/live/material-documents/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const vendorCountData = await vendorCountRes.json();
      const poCountData = await poCountRes.json();
      const docCountData = await docCountRes.json();

      setStats({
        totalVendors: vendorCountData.data?.count ?? vendorsData.data?.length ?? 0,
        activeVendors: metricsData.activeVendors || 0,
        totalPOs: poCountData.data?.count ?? poData.data?.length ?? 0,
        // Open-PO count still comes from the capped page above - SAP's PO
        // status is a composite processing status, not a single filterable
        // field, so a true live "open" count needs its own $filter logic.
        openPOs: poData.data?.filter((p: any) => {
          const s = mapSAPPOStatus(p.PurchaseOrderStatus);
          return s === 'pending' || s === 'approved';
        }).length || 0,
        totalMaterialDocs: docCountData.data?.count ?? docsData.data?.length ?? 0,
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
      'active': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'inactive': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'open': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'closed': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
      'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'draft': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'completed': 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const filteredVendors = vendors.filter(v => 
    v.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPOs = purchaseOrders.filter(p =>
    p.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-gray-600 dark:text-gray-400">Loading SAP data...</div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              SAP Data Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Complete view of all data synced from SAP S/4HANA</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            Error: {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Vendors</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVendors.toLocaleString()}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.activeVendors} active in local cache</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Orders</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalPOs.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.openPOs} open (of last {purchaseOrders.length} fetched)</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Material Documents</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalMaterialDocs.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Local DB Sync Status</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.syncedVendors.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vendors synced to local cache</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search across all SAP data (vendors, POs, material documents)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vendors Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => toggleSection('vendors')}
          >
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Vendors ({filteredVendors.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {vendors.length} loaded of {stats.totalVendors.toLocaleString()} in SAP
              </span>
              {expandedSections.vendors ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.vendors && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">GSTN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">City</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sync</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredVendors.slice(0, 20).map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {vendor.supplierCode}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {vendor.supplierName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {vendor.gstn || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
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
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVendors.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing 20 of {filteredVendors.length} vendors
                </div>
              )}
            </div>
          )}
        </div>

        {/* Purchase Orders Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => toggleSection('purchaseOrders')}
          >
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Purchase Orders ({filteredPOs.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {purchaseOrders.length} loaded of {stats.totalPOs.toLocaleString()} in SAP
              </span>
              {expandedSections.purchaseOrders ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.purchaseOrders && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredPOs.slice(0, 20).map((po) => (
                    <tr key={po.poNumber} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        {po.poNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {po.supplierName || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {parseSAPDate(po.poCreateDate)?.toLocaleDateString() || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {po.totalAmount} {po.currency || 'INR'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {po.lineItems?.length || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/procurement/purchase-orders/${po.poNumber}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPOs.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing 20 of {filteredPOs.length} purchase orders
                </div>
              )}
            </div>
          )}
        </div>

        {/* Material Documents Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div 
            className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => toggleSection('materialDocs')}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Material Documents ({filteredDocs.length})
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {materialDocs.length} loaded of {stats.totalMaterialDocs.toLocaleString()} in SAP
              </span>
              {expandedSections.materialDocs ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
          {expandedSections.materialDocs && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SAP ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDocs.slice(0, 20).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        {doc.documentNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {doc.materialCode || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {doc.quantity} {doc.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {doc.plant || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {doc.amount} {doc.currency || 'INR'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500 font-mono">
                        {doc.sapId?.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocs.length > 20 && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                  Showing 20 of {filteredDocs.length} material documents
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Showing all SAP data synced from S/4HANA Cloud • 
          {vendors.length} vendors • {purchaseOrders.length} purchase orders • {materialDocs.length} material documents
        </div>
      </div>
    </MainLayout>
  );
}

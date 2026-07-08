
'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Package, RefreshCw, Eye, Search, Filter, Clock, CheckCircle, AlertCircle, Building2, Zap } from 'lucide-react';
import Link from 'next/link';

interface PurchaseOrder {
  PurchaseOrder: string;
  Supplier: string;
  SupplierName?: string;
  PurchaseOrderDate: string;
  TotalAmount: number;
  DocumentCurrency: string;
  PurchaseOrderStatus: string;
  to_PurchaseOrderItem?: {
    results: any[];
  };
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('SAP');

  const fetchOrdersFromSAP = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      setRefreshing(true);
      setError('');

      // Fetch purchase orders directly from SAP
      const response = await fetch('http://localhost:3001/api/sap/purchase-orders?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setOrders(data.data);
        setDataSource('SAP');
      } else {
        setError(data.error || 'Failed to fetch purchase orders from SAP');
      }
    } catch (err: any) {
      console.error('Error fetching purchase orders:', err);
      setError(err.message || 'Failed to connect to SAP');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromSAP();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      '1': 'bg-green-100 text-green-800',
      '2': 'bg-blue-100 text-blue-800',
      '3': 'bg-purple-100 text-purple-800',
      '4': 'bg-gray-100 text-gray-800',
      '5': 'bg-red-100 text-red-800',
      '6': 'bg-teal-100 text-teal-800',
      'open': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'in_review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-purple-100 text-purple-800',
      'completed': 'bg-teal-100 text-teal-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      '1': 'Open',
      '2': 'In Review',
      '3': 'Approved',
      '4': 'Closed',
      '5': 'Cancelled',
      '6': 'Completed',
      'open': 'Open',
      'closed': 'Closed',
      'cancelled': 'Cancelled',
      'draft': 'Draft',
      'in_review': 'In Review',
      'approved': 'Approved',
      'completed': 'Completed'
    };
    return labels[status] || status || 'Unknown';
  };

  const filteredOrders = orders.filter(order => {
    const poNumber = order.PurchaseOrder || '';
    const supplierName = order.SupplierName || order.Supplier || '';
    const matchesSearch = poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.PurchaseOrderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalOrders = orders.length;
  const openOrders = orders.filter(o => o.PurchaseOrderStatus === '1' || o.PurchaseOrderStatus === 'open').length;
  const completedOrders = orders.filter(o => o.PurchaseOrderStatus === '4' || o.PurchaseOrderStatus === '6' || o.PurchaseOrderStatus === 'completed' || o.PurchaseOrderStatus === 'closed').length;
  const cancelledOrders = orders.filter(o => o.PurchaseOrderStatus === '5' || o.PurchaseOrderStatus === 'cancelled').length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">SAP Connection Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchOrdersFromSAP}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600">Live purchase orders from SAP S/4HANA</p>
              <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <Zap size={12} className="mr-1" />
                SAP Live
              </span>
            </div>
          </div>
          <button
            onClick={fetchOrdersFromSAP}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh from SAP'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-green-600 mt-1">✓ Live from SAP</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-2xl font-bold text-green-600">{openOrders}</p>
            <p className="text-xs text-green-600 mt-1">✓ Live from SAP</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{completedOrders}</p>
            <p className="text-xs text-blue-600 mt-1">✓ Live from SAP</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
            <p className="text-xs text-red-600 mt-1">✓ Live from SAP</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number or vendor..."
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
            <option value="1">Open</option>
            <option value="2">In Review</option>
            <option value="3">Approved</option>
            <option value="4">Closed</option>
            <option value="5">Cancelled</option>
            <option value="6">Completed</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No purchase orders found in SAP. Click "Refresh from SAP" to fetch orders.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr key={order.PurchaseOrder || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {order.PurchaseOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.SupplierName || order.Supplier || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.PurchaseOrderDate ? new Date(order.PurchaseOrderDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.TotalAmount || 0} {order.DocumentCurrency || 'INR'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.to_PurchaseOrderItem?.results?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.PurchaseOrderStatus)}`}>
                          {getStatusLabel(order.PurchaseOrderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/procurement/purchase-orders/${order.PurchaseOrder}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} />
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-green-800">Connected to SAP S/4HANA Cloud</p>
              <p className="text-xs text-green-700">Showing live purchase order data from SAP</p>
            </div>
          </div>
          <div className="text-xs text-green-700">
            {orders.length > 0 ? `${orders.length} orders loaded` : 'No orders loaded'}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


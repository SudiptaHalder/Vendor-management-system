'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Package, RefreshCw, Eye, Search, Filter, Clock, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import Link from 'next/link';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor?: {
    supplierCode: string;
    supplierName: string;
  };
  poCreateDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  sapSyncStatus: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin-login';
        return;
      }

      // Try both possible endpoints
      let response = await fetch('http://localhost:3001/api/purchase-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // If that fails, try the ERP endpoint
      if (response.status === 404) {
        response = await fetch('http://localhost:3001/api/erp/purchase-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // If still fails, try the purchase-order route (without 's')
      if (response.status === 404) {
        response = await fetch('http://localhost:3001/api/purchase-order', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setOrders(data.data || []);
      } else if (response.ok) {
        // If the response is successful but in a different format
        const ordersData = data.data || data.orders || data.results || [];
        setOrders(ordersData);
      } else {
        setError(data.error || 'Failed to fetch purchase orders');
        // Fallback: use data from database via vendors page
        console.log('Using fallback data');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load purchase orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Error: {error}
          <button 
            onClick={fetchOrders}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
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
            <p className="text-gray-600 mt-1">Manage purchase orders from SAP S/4HANA</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'open').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-600">{orders.filter(o => o.status === 'completed' || o.status === 'closed').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.status === 'cancelled').length}</p>
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
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No purchase orders found. Try syncing from SAP.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id || order.poNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {order.poNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.vendor?.supplierName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.poCreateDate ? new Date(order.poCreateDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.totalAmount} {order.currency || 'INR'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/procurement/purchase-orders/${order.id || order.poNumber}`}
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
      </div>
    </MainLayout>
  );
}

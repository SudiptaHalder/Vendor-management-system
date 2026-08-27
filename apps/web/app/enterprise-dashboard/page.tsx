'use client'

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Building2, FileText, Package, TrendingUp, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ReconciliationWidget from '@/components/erp/ReconciliationWidget';

export default function EnterpriseDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/vendor-metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/sync-vendors`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchMetrics();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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
            <h1 className="text-2xl font-bold text-gray-900">Enterprise Procurement Portal</h1>
            <p className="text-gray-600 mt-1">Complete ERP Integration with SAP S/4HANA</p>
          </div>
          <button
            onClick={syncData}
            disabled={syncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync with SAP'}</span>
          </button>
        </div>

        {/* Vendor Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalVendors || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeVendors || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.pendingVendors || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Synced to SAP</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.syncedVendors || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Reconciliation Widget */}
        <ReconciliationWidget />

        {/* Module Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
            <Package className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
            <p className="text-sm text-gray-600 mt-1">Track all POs, line items, delivery status</p>
            <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Details →
            </button>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
            <FileText className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Goods Receipts</h3>
            <p className="text-sm text-gray-600 mt-1">Material documents, delivery tracking</p>
            <button className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium">
              View Details →
            </button>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
            <TrendingUp className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">ERP Reconciliation</h3>
            <p className="text-sm text-gray-600 mt-1">PO vs Goods Receipt vs Invoice matching</p>
            <button className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

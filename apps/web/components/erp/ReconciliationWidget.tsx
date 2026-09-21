'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Package, TrendingUp } from 'lucide-react';

export default function ReconciliationWidget() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReconciliationSummary();
  }, []);

  const fetchReconciliationSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/erp/reconciliation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded"></div>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">ERP Reconciliation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary?.fullyDelivered || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Fully Delivered</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary?.partiallyDelivered || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Partially Delivered</p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary?.noDelivery || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">No Delivery</p>
        </div>
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary?.totalPOs || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total POs</p>
        </div>
      </div>
    </div>
  );
}

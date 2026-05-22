// apps/web/components/SAPSyncStatus.tsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Sync, Clock, AlertCircle } from 'lucide-react';

interface SyncStatus {
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  lastSyncAt?: string;
  nextSyncAt?: string;
  recordsProcessed?: number;
  errors?: string[];
}

export const SAPSyncStatus: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sap/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sap/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'all' })
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
        // Show success message
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <Sync className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'syncing': return 'bg-blue-50 border-blue-200';
      case 'failed': return 'bg-red-50 border-red-200';
      default: return 'bg-yellow-50 border-yellow-200';
    }
  };

  if (!status) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border shadow-lg ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">SAP Sync Status:</span>
            <span className="capitalize">{status.status}</span>
          </div>
          {status.lastSyncAt && (
            <div className="text-sm text-gray-600">
              Last sync: {new Date(status.lastSyncAt).toLocaleString()}
            </div>
          )}
          {status.recordsProcessed !== undefined && (
            <div className="text-sm text-gray-600">
              Records synced: {status.recordsProcessed}
            </div>
          )}
          {status.errors && status.errors.length > 0 && (
            <div className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              {status.errors[0]}
            </div>
          )}
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </div>
  );
};
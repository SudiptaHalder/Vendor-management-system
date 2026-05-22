// apps/web/components/PurchaseOrderWithSync.tsx

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface PurchaseOrderWithSyncProps {
  order: any;
  onUpdate: (id: number, data: any) => Promise<void>;
}

export const PurchaseOrderWithSync: React.FC<PurchaseOrderWithSyncProps> = ({ order, onUpdate }) => {
  const [syncing, setSyncing] = useState(false);
  const [showSyncStatus, setShowSyncStatus] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setSyncing(true);
    try {
      await onUpdate(order.id, { status: newStatus });
      // Show success message
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 relative">
      {/* Sync Status Badge */}
      <div className="absolute top-4 right-4">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onMouseEnter={() => setShowSyncStatus(true)}
          onMouseLeave={() => setShowSyncStatus(false)}
        >
          {order.syncInfo?.status === 'synced' ? (
            <div className="flex items-center text-green-600">
              <RefreshCw className="w-4 h-4 mr-1" />
              <span className="text-sm">Synced</span>
            </div>
          ) : order.syncInfo?.status === 'failed' ? (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Sync Failed</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}
          
          {/* Tooltip */}
          {showSyncStatus && order.syncInfo && (
            <div className="absolute right-0 top-8 mt-2 w-64 bg-gray-800 text-white text-sm rounded-lg shadow-xl z-10 p-3">
              <div className="font-medium mb-1">Sync Details</div>
              <div>Status: {order.syncInfo.status}</div>
              {order.syncInfo.lastSyncAt && (
                <div>Last Sync: {new Date(order.syncInfo.lastSyncAt).toLocaleString()}</div>
              )}
              {order.syncInfo.hasError && (
                <div className="text-red-300 mt-1">{order.syncInfo.errorMessage}</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Order Details */}
      <div className="pr-32">
        <h3 className="font-bold text-lg">PO #{order.poNumber}</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div>{order.totalAmount} {order.currency}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Document Date</div>
            <div>{new Date(order.documentDate).toLocaleDateString()}</div>
          </div>
        </div>
        
        {/* Status Update Buttons */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={syncing}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={syncing}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={syncing}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};
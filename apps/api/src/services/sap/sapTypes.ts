export interface SAPConfig {
  baseURL: string;
  username: string;
  password: string;
  client: string;
  language: string;
  timeout: number;
}

export interface SAPMaterialDocument {
  MaterialDocument: string;
  DocumentDate: string;
  PostingDate: string;
  CompanyCode: string;
  Plant: string;
  Material: string;
  Quantity: number;
  Unit: string;
  VendorCode: string;
  VendorName: string;
  PurchaseOrder: string;
  Amount: number;
  Currency: string;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  recordsFailed: number;
  errors: Array<{
    id: string;
    error: string;
    timestamp: Date;
  }>;
  syncId: string;
  logId?: string;
}

export interface SyncStatus {
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  recordsProcessed?: number;
  failedRecords?: number;
  pendingRetries?: number;
}

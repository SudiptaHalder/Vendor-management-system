import { prisma } from '@vendor-management/database';

export class SAPLogger {
  static async logSync(syncType: string, direction: string, status: string, details: any) {
    try {
      await prisma.sap_sync_logs.create({
        data: {
          syncType,
          direction,
          status,
          recordsProcessed: details.recordsProcessed || 0,
          recordsFailed: details.recordsFailed || 0,
          errorDetails: details.error ? JSON.stringify(details.error) : null,
          syncData: details.data || null,
          triggeredBy: details.triggeredBy || 'system'
        }
      });
    } catch (error) {
      console.error('Failed to log sync:', error);
    }
  }
}

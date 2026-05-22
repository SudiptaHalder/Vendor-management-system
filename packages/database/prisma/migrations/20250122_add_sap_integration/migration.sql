-- SAP Integration Migration
-- This migration adds SAP fields to existing tables and creates new SAP tables
-- Applied manually on 2025-01-22

-- Note: The actual schema changes were applied manually via SQL
-- This file exists to satisfy Prisma's migration tracking

-- Verify SAP tables exist
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sap_material_documents';
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sap_sync_logs';
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sap_failed_syncs';
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sap_configuration';

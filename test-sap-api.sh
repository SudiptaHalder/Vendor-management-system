#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW1reWwzbWswMDAwNGpzbzRmY3h1d2hzIiwiZW1haWwiOiJzdXBlcmFkbWluQHZlbmRvcmZsb3cuY29tIiwidHlwZSI6ImFkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzc5NDM0ODc2LCJleHAiOjE3ODAwMzk2NzZ9.iAggru9wQVw9ObtH-dgyQgPSWQqUtuMm4mVb1mGbqb0"

echo "========================================="
echo "Testing SAP Integration API"
echo "========================================="

echo -e "\n1. Testing Public Debug Endpoint:"
curl -s http://localhost:3001/api/sap/debug | jq '.success, .data.connection.success'

echo -e "\n2. Testing SAP Connection:"
curl -s http://localhost:3001/api/sap/test | jq '.success, .message'

echo -e "\n3. Checking Sync Status:"
curl -s -X GET http://localhost:3001/api/sap/sync/status \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data.status'

echo -e "\n4. Triggering Manual Sync:"
curl -s -X POST http://localhost:3001/api/sap/sync/trigger \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.success, .data.recordsSynced, .data.recordsFailed'

echo -e "\n5. Getting Recent Sync Logs:"
curl -s -X GET "http://localhost:3001/api/sap/logs?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data | length'

echo -e "\n6. Getting Material Documents:"
curl -s -X GET "http://localhost:3001/api/sap/material-documents?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.success, .data | length'

echo -e "\n========================================="
echo "Test Complete"
echo "========================================="

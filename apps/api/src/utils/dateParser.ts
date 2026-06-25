export function parseSAPDate(sapDate: string): Date | null {
  if (!sapDate) return null;
  
  // Handle SAP OData date format: /Date(1712361600000)/
  const match = sapDate.match(/\/Date\((\d+)\)\//);
  if (match) {
    const timestamp = parseInt(match[1]);
    return new Date(timestamp);
  }
  
  // Handle regular date strings
  const date = new Date(sapDate);
  return isNaN(date.getTime()) ? null : date;
}

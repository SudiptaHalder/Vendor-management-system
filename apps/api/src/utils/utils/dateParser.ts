export function parseSAPDate(sapDate: string): Date | null {
  if (!sapDate) return null;
  
  // Handle SAP OData date format: /Date(1718409600000)/
  const match = sapDate.match(/\/Date\((\d+)\)\//);
  if (match) {
    const timestamp = parseInt(match[1]);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  
  // Handle regular date strings
  const date = new Date(sapDate);
  return isNaN(date.getTime()) ? null : date;
}

export function parseSAPDateTime(sapDateTime: string): Date | null {
  if (!sapDateTime) return null;
  
  // Handle format: /Date(1719147949788+0000)/
  const match = sapDateTime.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    const timestamp = parseInt(match[1]);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  
  return parseSAPDate(sapDateTime);
}

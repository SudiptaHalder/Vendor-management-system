/**
 * Parse SAP OData date format
 * SAP returns dates as: /Date(1775001600000)/
 * Where the number is milliseconds since epoch
 */
export function parseSAPDate(sapDate: string): Date | null {
  if (!sapDate) return null;
  
  // Check if it's the SAP OData date format
  const match = sapDate.match(/\/Date\((\d+)\)\//);
  if (match && match[1]) {
    const timestamp = parseInt(match[1]);
    return new Date(timestamp);
  }
  
  // Try standard date parsing
  const date = new Date(sapDate);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  console.warn(`Unable to parse date: ${sapDate}`);
  return null;
}

/**
 * Format date for database storage
 */
export function formatForDatabase(sapDate: string): Date | null {
  const parsedDate = parseSAPDate(sapDate);
  return parsedDate;
}

/**
 * Safely get date or null
 */
export function safeDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  if (typeof dateValue === 'string') {
    return parseSAPDate(dateValue);
  }
  
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

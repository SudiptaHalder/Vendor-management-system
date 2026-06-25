import axios from 'axios';
import { SAPAuth } from './services/sap/sapAuth';

// Create a singleton SAP client
class SAPClient {
  private static instance: SAPClient;
  private client: any;

  private constructor() {
    const auth = SAPAuth.getInstance();
    this.client = auth.getClient();
  }

  public static getInstance(): SAPClient {
    if (!SAPClient.instance) {
      SAPClient.instance = new SAPClient();
    }
    return SAPClient.instance;
  }

  // GET request with automatic pagination handling
  async getAll<T>(url: string, options: any = {}): Promise<T[]> {
    const allResults: T[] = [];
    let nextLink: string | null = url;

    while (nextLink) {
      const response = await this.client.get(nextLink, {
        ...options,
        params: {
          ...options.params,
          $format: 'json'
        }
      });

      const results = response.data.d?.results || [];
      allResults.push(...results);

      // Check for next page
      nextLink = response.data.d?.__next || null;
      if (nextLink) {
        // Extract just the path from the full URL
        const urlObj = new URL(nextLink);
        nextLink = urlObj.pathname + urlObj.search;
      }
    }

    return allResults;
  }

  // Standard GET request
  async get<T>(url: string, options: any = {}): Promise<T> {
    const response = await this.client.get(url, {
      ...options,
      params: {
        ...options.params,
        $format: 'json'
      }
    });
    return response.data;
  }

  // POST request
  async post<T>(url: string, data: any, options: any = {}): Promise<T> {
    const response = await this.client.post(url, data, options);
    return response.data;
  }

  // PUT request
  async put<T>(url: string, data: any, options: any = {}): Promise<T> {
    const response = await this.client.put(url, data, options);
    return response.data;
  }

  // DELETE request
  async delete<T>(url: string, options: any = {}): Promise<T> {
    const response = await this.client.delete(url, options);
    return response.data;
  }
}

// Export a singleton instance
export const sapClient = SAPClient.getInstance();

// Also export the class for testing
export { SAPClient };

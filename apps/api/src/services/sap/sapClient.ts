import axios, { AxiosInstance } from 'axios';
import { SAPAuth } from './sapAuth';

class SAPClient {
  private client: AxiosInstance;
  private auth: SAPAuth;

  constructor() {
    this.auth = SAPAuth.getInstance();
    this.client = this.auth.getClient();
  }

  async get<T>(url: string, options?: any): Promise<T> {
    const response = await this.client.get(url, options);
    return response.data;
  }

  async getAll<T>(url: string, options?: any): Promise<T[]> {
    const allResults: T[] = [];
    let nextLink: string | null = url;
    
    while (nextLink) {
      const response = await this.client.get(nextLink, options);
      const results = response.data.d?.results || [];
      allResults.push(...results);
      
      // Handle pagination
      nextLink = response.data.d?.__next || null;
    }
    
    return allResults;
  }

  async post<T>(url: string, data?: any, options?: any): Promise<T> {
    const response = await this.client.post(url, data, options);
    return response.data;
  }

  async put<T>(url: string, data?: any, options?: any): Promise<T> {
    const response = await this.client.put(url, data, options);
    return response.data;
  }

  async delete<T>(url: string, options?: any): Promise<T> {
    const response = await this.client.delete(url, options);
    return response.data;
  }
}

export const sapClient = new SAPClient();

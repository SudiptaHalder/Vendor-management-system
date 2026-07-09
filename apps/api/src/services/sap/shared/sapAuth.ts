// apps/api/src/services/sap/shared/SAPAuth.ts


import axios, { AxiosInstance } from 'axios';

export class SAPAuth {
  private static instance: SAPAuth;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const baseURL = process.env.SAP_BASE_URL;
    const username = process.env.SAP_USERNAME;
    const password = process.env.SAP_PASSWORD;
    
    if (!baseURL || !username || !password) {
      throw new Error('SAP credentials not configured');
    }

    this.axiosInstance = axios.create({
      baseURL: baseURL.replace(/\/$/, ''),
      timeout: parseInt(process.env.SAP_TIMEOUT || '30000'),
      auth: { username, password },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'sap-client': process.env.SAP_CLIENT || '100',
        'sap-language': process.env.SAP_LANGUAGE || 'EN'
      }
    });

    this.setupInterceptors();
  }

  static getInstance(): SAPAuth {
    if (!SAPAuth.instance) {
      SAPAuth.instance = new SAPAuth();
    }
    return SAPAuth.instance;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use((config) => {
      console.log(`📤 SAP Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`📥 SAP Response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`❌ SAP Error: ${error.response?.status} - ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.axiosInstance;
  }
}

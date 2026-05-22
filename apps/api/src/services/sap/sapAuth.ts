import axios, { AxiosInstance, AxiosError } from 'axios';

export class SAPAuth {
  private static instance: SAPAuth;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const baseURL = process.env.SAP_BASE_URL;
    const username = process.env.SAP_USERNAME;
    const password = process.env.SAP_PASSWORD;
    
    if (!baseURL || !username || !password) {
      console.warn('⚠️ SAP credentials not configured. SAP features will be disabled.');
    }

    // Clean base URL - remove trailing slashes
    const cleanBaseURL = baseURL ? baseURL.replace(/\/$/, '') : '';

    this.axiosInstance = axios.create({
      baseURL: cleanBaseURL,
      timeout: parseInt(process.env.SAP_TIMEOUT || '30000'),
      auth: username && password ? { username, password } : undefined,
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
    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`📤 SAP Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`   Headers:`, JSON.stringify(config.headers, null, 2));
        if (config.params) {
          console.log(`   Params:`, config.params);
        }
        return config;
      },
      (error) => {
        console.error('❌ SAP Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`📥 SAP Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const statusText = error.response.statusText;
          const data = error.response.data;
          
          console.error(`❌ SAP Error: ${status} - ${statusText}`);
          
          // Specific error handling
          switch (status) {
            case 401:
              console.error('   🔐 Authentication failed - Check SAP username/password');
              break;
            case 403:
              console.error('   🚫 Authorization failed - Check SAP user permissions');
              break;
            case 406:
              console.error('   📄 Not Acceptable - Check Accept headers and OData format');
              console.error('   Make sure to use ?$format=json in URLs');
              break;
            case 404:
              console.error('   🔍 Not Found - Check API endpoint URL');
              break;
            default:
              if (data) {
                console.error(`   Details:`, JSON.stringify(data).substring(0, 200));
              }
          }
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ SAP Request Timeout - Check network connectivity');
        } else if (error.code === 'ENOTFOUND') {
          console.error('🌐 SAP Host not found - Check SAP_BASE_URL');
        } else {
          console.error('❌ SAP Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.axiosInstance;
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!process.env.SAP_ENABLED || process.env.SAP_ENABLED !== 'true') {
      return { success: false, message: 'SAP is disabled' };
    }

    const results: any = {};

    // Test 1: Metadata endpoint
    try {
      console.log('\n🔍 Testing SAP Metadata endpoint...');
      const metadataUrl = '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/$metadata';
      const response = await this.axiosInstance.get(metadataUrl, {
        headers: { 'Accept': 'application/xml' },
        timeout: 10000
      });
      results.metadata = {
        success: response.status === 200,
        status: response.status,
        message: 'Metadata endpoint accessible'
      };
      console.log('✅ Metadata test passed');
    } catch (error: any) {
      results.metadata = {
        success: false,
        error: error.message,
        status: error.response?.status
      };
      console.log('❌ Metadata test failed:', error.message);
    }

    // Test 2: Material Document Header endpoint with OData format
    try {
      console.log('\n🔍 Testing Material Document endpoint...');
      const docUrl = '/sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader';
      const response = await this.axiosInstance.get(docUrl, {
        params: { $format: 'json', $top: 1 },
        timeout: 10000
      });
      results.documents = {
        success: response.status === 200,
        status: response.status,
        message: 'Material documents endpoint accessible',
        hasData: !!response.data?.d?.results
      };
      console.log('✅ Material Document test passed');
    } catch (error: any) {
      results.documents = {
        success: false,
        error: error.message,
        status: error.response?.status
      };
      console.log('❌ Material Document test failed:', error.message);
    }

    const success = results.metadata?.success || results.documents?.success;
    
    return {
      success,
      message: success ? 'SAP connection successful' : 'SAP connection failed',
      details: results
    };
  }

  async makeODataRequest(url: string, params: any = {}): Promise<any> {
    // Always add $format=json for OData requests
    const odataParams = {
      ...params,
      $format: 'json'
    };
    
    console.log(`📡 Making OData request to: ${url}`);
    console.log(`   Params:`, odataParams);
    
    const response = await this.axiosInstance.get(url, { params: odataParams });
    return response.data;
  }
}

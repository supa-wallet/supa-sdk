/**
 * HTTP Client for Supa Backend API
 * Handles authentication and API communication
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiError } from './types';

export interface ClientConfig {
  baseURL?: string;
  nodeIdentifier: string;
  /** Optional app identifier for app-specific backend rules */
  supaAppId?: string;
  /** Optional SDK version (sent as X-Supa-SDK header) */
  sdkVersion?: string;
  getAccessToken?: () => Promise<string | null>;
}

export class ApiClient {
  private client: AxiosInstance;
  private getAccessToken?: () => Promise<string | null>;
  private nodeIdentifier: string;
  private supaAppId?: string;
  private sdkVersion?: string;

  constructor(config: ClientConfig = { nodeIdentifier: '' }) {
    const baseURL = config.baseURL || import.meta.env.VITE_API_BASE_URL || 'https://stage_api.supa.fyi';
    this.nodeIdentifier = config.nodeIdentifier;
    this.supaAppId = config.supaAppId;
    const configuredSdkVersion = config.sdkVersion?.trim();
    const bundledSdkVersion = __SUPA_SDK_VERSION__?.trim();
    this.sdkVersion = configuredSdkVersion || bundledSdkVersion || undefined;
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.getAccessToken = config.getAccessToken;

    // Request interceptor to add auth token and Canton node header
    this.client.interceptors.request.use(
      async (config) => {
        if (this.getAccessToken) {
          try {
            const token = await this.getAccessToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('[Supa SDK] ❌ Failed to get access token:', error);
          }
        }
        
        // Add X-Canton-Node-Id header for all /canton/... requests
        if (config.url?.startsWith('/canton/')) {
          config.headers['X-Canton-Node-Id'] = this.nodeIdentifier;
        }

        // Add X-Supa-App-Id for app-specific backend rules (all requests)
        if (this.supaAppId) {
          config.headers['X-Supa-App-Id'] = this.supaAppId;
        }

        // Add SDK version header for backend analytics/routing (all requests)
        if (this.sdkVersion) {
          config.headers['X-Supa-SDK'] = this.sdkVersion;
        }
        
        // Log request details
        console.group(`[Supa SDK] 📤 REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Headers:', {
          'Content-Type': config.headers['Content-Type'],
          'Authorization': config.headers.Authorization ? `Bearer ***${String(config.headers.Authorization).slice(-20)}` : 'none',
          'X-Canton-Node-Id': config.headers['X-Canton-Node-Id'] || 'none',
          'X-Supa-App-Id': config.headers['X-Supa-App-Id'] || 'none',
          'X-Supa-SDK': config.headers['X-Supa-SDK'] || 'none',
        });
        if (config.data) {
          console.log('Request Body:', config.data);
        }
        console.groupEnd();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.group(`[Supa SDK] 📥 RESPONSE: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log('Status:', response.status, response.statusText);
        console.log('Response Data:', response.data);
        console.groupEnd();
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          console.group(`[Supa SDK] ❌ ERROR RESPONSE: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
          console.error('Status:', error.response.status, error.response.statusText);
          console.error('Request Body:', error.config?.data);
          console.error('Response Data:', error.response.data);
          console.groupEnd();
          
          const apiError: ApiError = {
            statusCode: error.response.status,
            message: error.response.data?.message || error.message,
            error: error.response.data?.error,
          };
          return Promise.reject(apiError);
        }
        console.error('[Supa SDK] ❌ Network error:', error.message);
        return Promise.reject({
          statusCode: 0,
          message: error.message || 'Network error',
        } as ApiError);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  setAccessTokenGetter(getter: () => Promise<string | null>) {
    this.getAccessToken = getter;
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }
}

// Singleton instance
let clientInstance: ApiClient | null = null;

export function createApiClient(config?: ClientConfig): ApiClient {
  clientInstance = new ApiClient(config);
  return clientInstance;
}

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    throw new Error('ApiClient not initialized. Call createApiClient first.');
  }
  return clientInstance;
}

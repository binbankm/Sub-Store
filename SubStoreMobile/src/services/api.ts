import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ApiResponse, Subscription, Collection, Artifact, Token, AppSettings, FlowInfo, LogEntry } from '../types';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string = '';
  private token: string = '';

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      const savedUrl = await SecureStore.getItemAsync('server_url');
      const savedToken = await SecureStore.getItemAsync('server_token');
      
      if (savedUrl) {
        this.baseURL = savedUrl;
        this.client.defaults.baseURL = savedUrl;
      }
      
      if (savedToken) {
        this.token = savedToken;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    } catch (error) {
      console.error('Failed to initialize API service:', error);
    }
  }

  async setServerConfig(url: string, token?: string): Promise<void> {
    this.baseURL = url.replace(/\/$/, '');
    this.client.defaults.baseURL = this.baseURL;
    
    await SecureStore.setItemAsync('server_url', this.baseURL);
    
    if (token) {
      this.token = token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await SecureStore.setItemAsync('server_token', token);
    }
  }

  getServerUrl(): string {
    return this.baseURL;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return error.response.data as ApiResponse<T>;
        }
        return {
          status: 'failed',
          message: error.message || 'Network error',
        };
      }
      return {
        status: 'failed',
        message: 'Unknown error occurred',
      };
    }
  }

  async getAllSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return this.request({ method: 'GET', url: '/api/subs' });
  }

  async getSubscription(name: string): Promise<ApiResponse<Subscription>> {
    return this.request({ method: 'GET', url: `/api/sub/${encodeURIComponent(name)}` });
  }

  async createSubscription(sub: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return this.request({ method: 'POST', url: '/api/subs', data: sub });
  }

  async updateSubscription(name: string, updates: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
    return this.request({ method: 'PATCH', url: `/api/sub/${encodeURIComponent(name)}`, data: updates });
  }

  async deleteSubscription(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/sub/${encodeURIComponent(name)}` });
  }

  async replaceSubscriptions(subs: Subscription[]): Promise<ApiResponse<void>> {
    return this.request({ method: 'PUT', url: '/api/subs', data: subs });
  }

  async getFlowInfo(name: string): Promise<ApiResponse<FlowInfo>> {
    return this.request({ method: 'GET', url: `/api/sub/flow/${encodeURIComponent(name)}` });
  }

  async getAllCollections(): Promise<ApiResponse<Collection[]>> {
    return this.request({ method: 'GET', url: '/api/collections' });
  }

  async getCollection(name: string): Promise<ApiResponse<Collection>> {
    return this.request({ method: 'GET', url: `/api/collection/${encodeURIComponent(name)}` });
  }

  async createCollection(collection: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return this.request({ method: 'POST', url: '/api/collections', data: collection });
  }

  async updateCollection(name: string, updates: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return this.request({ method: 'PATCH', url: `/api/collection/${encodeURIComponent(name)}`, data: updates });
  }

  async deleteCollection(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/collection/${encodeURIComponent(name)}` });
  }

  async getAllArtifacts(): Promise<ApiResponse<Artifact[]>> {
    return this.request({ method: 'GET', url: '/api/artifacts' });
  }

  async getArtifact(name: string): Promise<ApiResponse<Artifact>> {
    return this.request({ method: 'GET', url: `/api/artifact/${encodeURIComponent(name)}` });
  }

  async createArtifact(artifact: Partial<Artifact>): Promise<ApiResponse<Artifact>> {
    return this.request({ method: 'POST', url: '/api/artifacts', data: artifact });
  }

  async updateArtifact(name: string, updates: Partial<Artifact>): Promise<ApiResponse<Artifact>> {
    return this.request({ method: 'PATCH', url: `/api/artifact/${encodeURIComponent(name)}`, data: updates });
  }

  async deleteArtifact(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/artifact/${encodeURIComponent(name)}` });
  }

  async syncArtifact(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: `/api/artifact/${encodeURIComponent(name)}/sync` });
  }

  async syncAllArtifacts(): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: '/api/sync/artifacts' });
  }

  async getTokens(): Promise<ApiResponse<Token[]>> {
    return this.request({ method: 'GET', url: '/api/tokens' });
  }

  async createToken(token: Partial<Token>): Promise<ApiResponse<Token>> {
    return this.request({ method: 'POST', url: '/api/tokens', data: token });
  }

  async deleteToken(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/token/${encodeURIComponent(name)}` });
  }

  async getSettings(): Promise<ApiResponse<AppSettings>> {
    return this.request({ method: 'GET', url: '/api/settings' });
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> {
    return this.request({ method: 'PATCH', url: '/api/settings', data: settings });
  }

  async getLogs(): Promise<ApiResponse<LogEntry[]>> {
    return this.request({ method: 'GET', url: '/api/logs' });
  }

  async clearLogs(): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: '/api/logs' });
  }

  async preview(name: string, type: 'sub' | 'collection', platform: string): Promise<ApiResponse<string>> {
    return this.request({ method: 'GET', url: `/api/preview/${type}/${encodeURIComponent(name)}?target=${platform}` });
  }

  async download(name: string, type: 'sub' | 'collection', platform: string): Promise<ApiResponse<string>> {
    return this.request({ method: 'GET', url: `/api/download/${type}/${encodeURIComponent(name)}?target=${platform}` });
  }

  async syncToGist(): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: '/api/sync/gist/upload' });
  }

  async syncFromGist(): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: '/api/sync/gist/download' });
  }

  async getNodeInfo(name: string): Promise<ApiResponse<any>> {
    return this.request({ method: 'GET', url: `/api/node-info/${encodeURIComponent(name)}` });
  }

  async sortSubscriptions(names: string[]): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: '/api/sort/subs', data: { names } });
  }

  async sortCollections(names: string[]): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: '/api/sort/collections', data: { names } });
  }

  async getFiles(): Promise<ApiResponse<any[]>> {
    return this.request({ method: 'GET', url: '/api/files' });
  }

  async getFile(name: string): Promise<ApiResponse<any>> {
    return this.request({ method: 'GET', url: `/api/file/${encodeURIComponent(name)}` });
  }

  async uploadFile(name: string, content: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: `/api/file/${encodeURIComponent(name)}`, data: { content } });
  }

  async deleteFile(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/file/${encodeURIComponent(name)}` });
  }

  async getArchives(): Promise<ApiResponse<any[]>> {
    return this.request({ method: 'GET', url: '/api/archives' });
  }

  async archiveSubscription(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: `/api/archive/sub/${encodeURIComponent(name)}` });
  }

  async archiveCollection(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: `/api/archive/collection/${encodeURIComponent(name)}` });
  }

  async restoreArchive(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'POST', url: `/api/archive/restore/${encodeURIComponent(name)}` });
  }

  async deleteArchive(name: string): Promise<ApiResponse<void>> {
    return this.request({ method: 'DELETE', url: `/api/archive/${encodeURIComponent(name)}` });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

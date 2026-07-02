import { LoginCredentials, AuthResponse } from '@villex/types';

export interface VillexClientOptions {
  baseUrl: string;
  token?: string;
  onTokenRefresh?: (newToken: string) => void;
}

export class VillexClient {
  private baseUrl: string;
  private token?: string;
  private onTokenRefresh?: (newToken: string) => void;

  constructor(options: VillexClientOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
    this.onTokenRefresh = options.onTokenRefresh;
  }

  public setToken(token: string) {
    this.token = token;
    this.onTokenRefresh?.(token);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText} (${response.status})`);
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.accessToken);
    return response;
  }

  public async getProfile(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/profile');
  }

  public async logout(): Promise<void> {
    await this.request<void>('/auth/logout', { method: 'POST' });
    this.token = undefined;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          throw new Error(
            data.errors
              .map((e: { msg?: string; message?: string }) => e.msg || e.message)
              .join(', ')
          );
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    // Logs para depurar el problema del email
    if (endpoint.includes('/auth/register')) {
      console.log('ApiService - Data original:', data);
      
      const jsonString = JSON.stringify(data);
      console.log('ApiService - JSON.stringify result:', jsonString);
      
      const parsedBack = JSON.parse(jsonString);
      console.log('ApiService - Parsed back:', parsedBack);
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ── Component-specific helpers ────────────────────────────────────────────
  async getComponents(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search)   qs.set('search', params.search);
    if (params?.page)     qs.set('page', String(params.page));
    if (params?.limit)    qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs}` : '';
    return this.request<unknown>(`/components${query}`, { method: 'GET' });
  }

  async createComponent(data: {
    name: string;
    description?: string;
    category: string;
    code: string;
    tags?: string[];
    framework?: string;
    props?: unknown[];
  }) {
    return this.request<unknown>('/components', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteComponent(id: number) {
    return this.request<unknown>(`/components/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService(API_BASE_URL);
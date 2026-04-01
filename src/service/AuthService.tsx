import { apiService } from '../service/ApiService';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  ProfileUpdateRequest 
} from '../types/auth';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<{ data: AuthResponse }>('/auth/login', credentials);
    
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Log para depurar en AuthService
    console.log("AuthService - userData recibido:", userData);
    console.log("AuthService - email específico:", userData.email);
    
    const response = await apiService.post<{ data: AuthResponse }>('/auth/register', userData);
    
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ data: User }>('/auth/profile');
    return response.data;
  }

  async updateProfile(profileData: ProfileUpdateRequest): Promise<User> {
    const response = await apiService.put<{ data: User }>('/auth/profile', profileData);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async requestPasswordReset(data: { email: string }) {
    const response = await apiService.post('/auth/request-password-reset', data);
    return response;
  }
}

export const authService = new AuthService();
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string; 
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string; 
    email: string;
    role: string;
    preferences?: Record<string, unknown>;
    avatar?: string;   
  };
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
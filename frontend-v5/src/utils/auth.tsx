// utils/auth.ts
import axios from 'axios';

interface TokenResponse {
  access: string;
  refresh?: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    username: string;
  };
}

export async function register(data: RegisterPayload): Promise<{ user: { username: string } }> {
  const response = await axios.post<LoginResponse>(
    'http://127.0.0.1:8000/api/register/',
    data,
    { headers: { 'Content-Type': 'application/json' } }
  );

  const { access, refresh, user } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  return { user };
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    'http://127.0.0.1:8000/api/token/',
    { username, password },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data; 
}


export async function refreshToken(): Promise<string> {
  let refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    refresh = sessionStorage.getItem('refresh_token');
  }
  if (!refresh) throw new Error('No refresh token found');

  try {
    const response = await axios.post<TokenResponse>(
      'http://127.0.0.1:8000/api/token/refresh/',
      { refresh },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access } = response.data;
    if (!access) throw new Error('Access token missing');

    localStorage.setItem('access_token', access);
    return access;
  } catch (error) {
    console.error('Refresh token failed', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
}

export function getCurrentUser(): any | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

export function isTokenExpired(): boolean {
  const user = getCurrentUser();
  if (!user) return true;
  return Date.now() >= user.exp * 1000;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token') && !isTokenExpired();
}

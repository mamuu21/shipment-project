// utils/auth.ts

import { useNavigate } from 'react-router-dom';
import api from './api';

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
  const response = await api.post<LoginResponse>(
    '/register/',
    data,
    { headers: { 'Content-Type': 'application/json' } }
  );

  const { access, refresh, user } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  return { user };
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>(
    '/auth/login/',
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
    const response = await api.post<TokenResponse>(
      '/auth/refresh/',
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
  let token = localStorage.getItem('access_token');
  if (!token) {
    token = sessionStorage.getItem('access_token');
  }
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

export function useLogout() {
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };
}

export function isTokenExpired(): boolean {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (!token) return true;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const user = JSON.parse(jsonPayload);
    return Date.now() >= user.exp * 1000;
  } catch (error) {
    console.error('Failed to decode token', error);
    return true;
  }
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  return !!token && !isTokenExpired();
}

// Permission functions based on backend roles
export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function isStaff(): boolean {
  return getUserRole() === 'staff';
}

export function isCustomer(): boolean {
  return getUserRole() === 'customer';
}

export function isAdminOrStaff(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'staff';
}

export function isAdminOrStaffOrCustomer(): boolean {
  const role = getUserRole();
  return role === 'admin' || role === 'staff' || role === 'customer';
}

// CRUD permission checks based on backend RoleBasedAccessPermission
export function canCreate(): boolean {
  if (!isAuthenticated()) return false;
  const role = getUserRole();
  return role === 'admin' || role === 'staff';
}

export function canRead(): boolean {
  return isAuthenticated();
}

export function canUpdate(): boolean {
  if (!isAuthenticated()) return false;
  const role = getUserRole();
  return role === 'admin' || role === 'staff' || role === 'customer';
}

export function canDelete(): boolean {
  if (!isAuthenticated()) return false;
  const role = getUserRole();
  return role === 'admin'; // Only admin can delete
}

// Specific permission checks for different resources
export function canManageShipments(): boolean {
  return isAdminOrStaff();
}

export function canManageCustomers(): boolean {
  return isAdminOrStaff();
}

export function canManageParcels(): boolean {
  return isAdminOrStaff();
}

export function canManageInvoices(): boolean {
  return isAdminOrStaff();
}

export function canViewAllData(): boolean {
  return isAdminOrStaff();
}

export function canViewOwnData(): boolean {
  return isAuthenticated();
}

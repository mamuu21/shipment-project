// utils/auth.js
import axios from 'axios';

export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

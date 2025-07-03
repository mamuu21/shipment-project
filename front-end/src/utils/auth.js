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

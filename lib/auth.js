import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data.data;
  localStorage.setItem('simatrack_token', token);
  localStorage.setItem('simatrack_user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem('simatrack_token');
  localStorage.removeItem('simatrack_user');
  window.location.href = '/login';
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('simatrack_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('simatrack_token');
}

export function isLoggedIn() {
  return !!getToken();
}

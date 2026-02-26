import api from './client';
import type { LoginResponse } from '../types/api';

export const authApi = {
  register(name: string, email: string, password: string) {
    return api.post<{ data: LoginResponse }>('/auth/register', { name, email, password });
  },

  login(email: string, password: string) {
    return api.post<{ data: LoginResponse }>('/auth/login', { email, password });
  },

  googleSignIn(idToken: string, nonce?: string) {
    return api.post<{ data: LoginResponse }>('/auth/google', { idToken, nonce });
  },

  phoneSignIn(firebaseIdToken: string) {
    return api.post<{ data: LoginResponse }>('/auth/phone', { firebaseIdToken });
  },

  refresh(refreshToken: string) {
    return api.post('/auth/refresh', { refreshToken });
  },

  logout() {
    return api.post('/auth/logout');
  },

  verify() {
    return api.get('/auth/verify');
  },

  me() {
    return api.get('/auth/me');
  },
};

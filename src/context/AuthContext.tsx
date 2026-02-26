import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { setTokens, clearTokens, getAccessToken } from '../api/client';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string, nonce?: string) => Promise<void>;
  phoneSignIn: (firebaseIdToken: string) => Promise<void>;
  skipLogin: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('guestMode') === 'true');

  const setAuth = (user: User) =>
    setState({ user, isAuthenticated: true, isLoading: false, error: null });

  const clearAuth = () =>
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });

  // Restore session on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authApi
      .me()
      .then(({ data }) => setAuth(data.data))
      .catch(() => {
        clearTokens();
        clearAuth();
      });
  }, []);

  // Listen for forced logout (from 401 interceptor)
  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const handleAuthResponse = (response: { data: { user: User; accessToken: string; refreshToken: string } }) => {
    const { user, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);
    setAuth(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await authApi.login(email, password);
      handleAuthResponse(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await authApi.register(name, email, password);
      handleAuthResponse(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const googleSignIn = useCallback(async (idToken: string, nonce?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await authApi.googleSignIn(idToken, nonce);
      handleAuthResponse(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google sign-in failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const phoneSignIn = useCallback(async (firebaseIdToken: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await authApi.phoneSignIn(firebaseIdToken);
      handleAuthResponse(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Phone sign-in failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const skipLogin = useCallback(() => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — clear local state regardless
    }
    clearTokens();
    localStorage.removeItem('guestMode');
    setIsGuest(false);
    clearAuth();
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, googleSignIn, phoneSignIn, skipLogin, logout, clearError, isGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

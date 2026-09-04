import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError, getToken, setToken, clearToken, loginWithPin as loginWithPinRequest } from '../api/client';
import { UserRoleItem } from '../api/types';

interface AuthContextValue {
  user: UserRoleItem | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRoleItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await apiFetch<UserRoleItem>('/auth/me');
        setUser(me);
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiFetch<{ token: string; user: UserRoleItem }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password })
    });
    await setToken(result.token);
    setUser(result.user);
  }, []);

  const loginWithPin = useCallback(async (pin: string) => {
    const result = await loginWithPinRequest<{ token: string; user: UserRoleItem }>(pin);
    await setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };

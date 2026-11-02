import React, { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client';

type User = { id: number; username: string; displayName: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('erp_token'),
  );
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('erp_user');
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      token,
      async login(username, password) {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('erp_token', data.accessToken);
        localStorage.setItem('erp_user', JSON.stringify(data.user));
        setToken(data.accessToken);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}

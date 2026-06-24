"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, ApiError } from "@/lib/api";
import { clearSession, readToken, readUser, writeSession } from "@/lib/auth";
import type { User } from "@/types/api";

type AuthState = {
  user: User | null;
  token: string | null;
  ready: boolean; // true after first hydration
  login: (token: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  hasRole: (role: "JOB_SEEKER" | "EMPLOYER" | "ADMIN") => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user, token, ready }, setAuth] = useState<{
    user: User | null;
    token: string | null;
    ready: boolean;
  }>({
    user: null,
    token: null,
    ready: false,
  });

  useEffect(() => {
    setAuth({
      user: readUser(),
      token: readToken(),
      ready: true,
    });
  }, []);

  const login = useCallback((t: string, u: User) => {
    writeSession(t, u);
    setAuth((s) => ({ ...s, token: t, user: u }));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAuth((s) => ({ ...s, token: null, user: null }));
  }, []);

  const refresh = useCallback(async () => {
    if (!readToken()) return;
    try {
      const profile = await authApi.profile();
      const t = readToken()!;
      writeSession(t, profile);
      setAuth((s) => ({ ...s, token: t, user: profile }));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearSession();
        setAuth((s) => ({ ...s, token: null, user: null }));
      }
    }
  }, []);

  const hasRole = useCallback(
    (role: "JOB_SEEKER" | "EMPLOYER" | "ADMIN") => {
      return !!user?.roles?.includes(role);
    },
    [user]
  );

  const value = useMemo<AuthState>(
    () => ({ user, token, ready, login, logout, refresh, hasRole }),
    [user, token, ready, login, logout, refresh, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

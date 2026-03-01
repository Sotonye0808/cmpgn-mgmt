"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ROUTES } from "@/config/routes";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API.AUTH.ME);
      if (res.ok) {
        const json = await res.json();
        setUser(json.data ?? null);
      } else if (res.status === 401) {
        // Access cookie expired — attempt silent refresh using the refresh cookie
        const refreshRes = await fetch(ROUTES.API.AUTH.REFRESH, {
          method: "POST",
        });
        if (refreshRes.ok) {
          // New access cookie has been set — retry /me
          const retryRes = await fetch(ROUTES.API.AUTH.ME);
          if (retryRes.ok) {
            const json = await retryRes.json();
            setUser(json.data ?? null);
          } else {
            setUser(null);
          }
        } else {
          // Refresh also failed (expired or missing) — full logout
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const res = await fetch(ROUTES.API.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Login failed");
      setUser(json.data);
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch(ROUTES.API.AUTH.LOGOUT, { method: "POST" });
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role as string);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

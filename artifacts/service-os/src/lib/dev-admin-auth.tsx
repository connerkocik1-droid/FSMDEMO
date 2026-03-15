import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface DevAdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getToken: () => string | null;
}

const DevAdminAuthContext = createContext<DevAdminAuthContextType | null>(null);

const TOKEN_KEY = "dev_admin_token";
const EMAIL_KEY = "dev_admin_email";

export function DevAdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedEmail = localStorage.getItem(EMAIL_KEY);
    if (token) {
      fetch(`${import.meta.env.BASE_URL}api/dev-admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => {
          if (r.ok) {
            setIsAuthenticated(true);
            setEmail(savedEmail);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(EMAIL_KEY);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/dev-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.message || "Invalid credentials" };
      }

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, data.email);
      setIsAuthenticated(true);
      setEmail(data.email);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setIsAuthenticated(false);
    setEmail(null);
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  return (
    <DevAdminAuthContext.Provider value={{ isAuthenticated, isLoading, email, login, logout, getToken }}>
      {children}
    </DevAdminAuthContext.Provider>
  );
}

export function useDevAdminAuth() {
  const ctx = useContext(DevAdminAuthContext);
  if (!ctx) throw new Error("useDevAdminAuth must be used within DevAdminAuthProvider");
  return ctx;
}

export function devAdminFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(`${import.meta.env.BASE_URL}api/dev-admin${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });
}

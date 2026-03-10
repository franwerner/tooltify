import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../shared/serverUrl";
import { storage } from "../tools/build-monitor/storage";

interface AuthState {
  user: string | null;
  loading: boolean;
}

export function useAuth() {
  const cached = storage.getUser();
  const [state, setState] = useState<AuthState>({
    user: cached || null,
    loading: !cached,
  });

  useEffect(() => {
    apiFetch("/auth/session")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.user) {
          storage.setUser(res.user);
          setState({ user: res.user, loading: false });
        } else {
          storage.setUser("");
          setState({ user: null, loading: false });
        }
      })
      .catch(() => setState({ user: null, loading: false }));
  }, []);

  const login = useCallback(async (user: string, password: string): Promise<string | null> => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await res.json();
      if (data.ok) {
        storage.setUser(data.user);
        setState({ user: data.user, loading: false });
        return null;
      }
      return data.error || "Login failed";
    } catch {
      return "Connection error";
    }
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout").catch(() => {});
    storage.setUser("");
    setState({ user: null, loading: false });
  }, []);

  return { user: state.user, loading: state.loading, login, logout };
}

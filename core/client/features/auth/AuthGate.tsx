import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { useLogout } from "./hooks/useLogout";
import { FabButton } from "../../shared/components/FabButton";
import { DevtoolsPortal } from "../../tools/build-monitor/components/DevtoolsPortal";

interface AuthCtx {
  user: string;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({ user: "", logout: () => { } });

export const useSession = () => useContext(AuthContext);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="7" width="9" height="7" rx="1.5" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
  </svg>
);

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: sessionUser, loading } = useAuth();
  const [user, setUser] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const { logout } = useLogout(() => setUser(null));

  useEffect(() => {
    if (!loading) setUser(sessionUser);
  }, [sessionUser, loading]);

  if (loading) return null;

  if (!user) {
    return (
      <DevtoolsPortal>
        <FabButton style={{ right: 20, color: "#8b949e" }} onClick={() => setShowLogin(true)} title="Devtools Login">
          <LockIcon />
        </FabButton>
        {showLogin && (
          <LoginForm
            onLogin={(loggedUser) => { setUser(loggedUser); setShowLogin(false); }}
            onClose={() => setShowLogin(false)}
          />
        )}
      </DevtoolsPortal>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

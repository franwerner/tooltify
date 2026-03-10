import React, { createContext, useContext, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "./LoginForm";
import { COLORS } from "../shared/colors";

interface AuthCtx {
  user: string;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({ user: "", logout: async () => {} });

export const useSession = () => useContext(AuthContext);

const fabStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: COLORS.bg,
  border: `1px solid ${COLORS.border}`,
  cursor: "pointer",
  zIndex: 999998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  padding: 0,
  color: COLORS.muted,
};

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="7" width="9" height="7" rx="1.5" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" />
  </svg>
);

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <>
        <button
          style={fabStyle}
          onClick={() => setShowLogin(true)}
          title="Devtools Login"
        >
          <LockIcon />
        </button>
        {showLogin && (
          <LoginForm onLogin={login} onClose={() => setShowLogin(false)} />
        )}
      </>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

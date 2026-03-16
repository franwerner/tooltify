import React, { useState } from "react";
import type { CSSProperties } from "react";
import { useFetch } from "../../shared/hooks/useFetch";
import { useLogin } from "./hooks/useLogin";

interface Props {
  onLogin: (user: string) => void;
  onClose: () => void;
}

const COLORS = {
  accent: "#4f8cff",
  border: "#23262b",
  muted: "#a0a4ab",
  input: "#23262b",
  text: "#e2e6ee",
  red: "#ff4f4f"
};

const s: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    zIndex: 9999999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  card: {
    background: "#1a1d23",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    width: 340,
    padding: "28px 24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
  },
  title: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 6,
    display: "block",
  },
  select: {
    width: "100%",
    padding: "8px 10px",
    background: COLORS.input,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    background: COLORS.input,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 18,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "9px 0",
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  message: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
};

const BUTTON_LABEL: Record<string, string> = {
  idle: "Login",
  loading: "Logging in...",
  success: "Success",
  error: "Try again",
}

export const LoginForm: React.FC<Props> = ({ onLogin, onClose }) => {
  const { data: users } = useFetch<string[]>("/auth/users");
  const { login, state, error } = useLogin(onLogin);
  const [{ user, password }, setForm] = useState({
    user: "",
    password: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    login(user, password);
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <form style={s.card} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>Tooltify Login</div>

        <label style={s.label}>User</label>
        <select
          style={s.select}
          value={user}
          onChange={(e) => setForm(prev => ({ ...prev, user: e.target.value }))}
        >
          <option value="">-- select user --</option>
          {(users ?? []).map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter password"
          autoFocus
        />

        {state === "error" && (
          <div style={{ ...s.message, color: COLORS.red }}>{error}</div>
        )}
        {state === "success" && (
          <div style={{ ...s.message, color: COLORS.accent }}>Logged in successfully</div>
        )}

        <button
          style={s.button}
          type="submit"
          disabled={state === "loading" || state === "success" || !user}
        >
          {BUTTON_LABEL[state]}
        </button>
      </form>
    </div>
  );
};

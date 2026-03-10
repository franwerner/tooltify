import React, { useState, useEffect } from "react";
import { COLORS } from "../shared/colors";
import { storage } from "../tools/build-monitor/storage";
import type { CSSProperties } from "react";

interface Props {
  onLogin: (user: string, password: string) => Promise<string | null>;
  onClose: () => void;
}

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
  error: {
    color: COLORS.red,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
};

export const LoginForm: React.FC<Props> = ({ onLogin, onClose }) => {
  const [users, setUsers] = useState<string[]>([]);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storage.fetchUsers().then(setUsers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    const err = await onLogin(user, password);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <form style={s.card} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>Devtools Login</div>

        <label style={s.label}>User</label>
        <select
          style={s.select}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        >
          <option value="">-- select user --</option>
          {users.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
        />

        {error && <div style={s.error}>{error}</div>}

        <button style={s.button} type="submit" disabled={loading || !user}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

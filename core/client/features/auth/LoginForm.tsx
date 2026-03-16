import React, { useState } from "react";
import { useFetch } from "../../shared/hooks/useFetch";
import { useLogin } from "./hooks/useLogin";

interface Props {
  onLogin: (user: string) => void;
  onClose: () => void;
}

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
    <div
      className="tfy-fixed tfy-inset-0 tfy-bg-black/[0.7] tfy-z-[9999999] tfy-flex tfy-items-center tfy-justify-center tfy-font-mono tfy-backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        className="tfy-border tfy-border-[#23262b] tfy-bg-surface tfy-rounded-[12px] tfy-shadow-[0_8px_40px_rgba(0,0,0,0.5)] tfy-w-[340px] tfy-py-7 tfy-px-6"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tfy-text-accent tfy-font-bold tfy-text-[15px] tfy-mb-5 tfy-text-center">Tooltify Login</div>

        <label className="tfy-text-muted tfy-text-[11px] tfy-font-semibold tfy-uppercase tfy-tracking-[0.5px] tfy-mb-1.5 tfy-block">User</label>
        <select
          className="tfy-w-full tfy-bg-[#23262b] tfy-text-[#e2e6ee] tfy-border tfy-border-[#23262b] tfy-rounded-md tfy-text-[13px] tfy-outline-none tfy-mb-3.5 tfy-py-2 tfy-px-2.5 tfy-font-mono"
          value={user}
          onChange={(e) => setForm(prev => ({ ...prev, user: e.target.value }))}
        >
          <option value="">-- select user --</option>
          {(users ?? []).map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <label className="tfy-text-muted tfy-text-[11px] tfy-font-semibold tfy-uppercase tfy-tracking-[0.5px] tfy-mb-1.5 tfy-block">Password</label>
        <input
          className="tfy-w-full tfy-bg-[#23262b] tfy-text-[#e2e6ee] tfy-border tfy-border-[#23262b] tfy-rounded-md tfy-text-[13px] tfy-outline-none tfy-box-border tfy-mb-[18px] tfy-py-2 tfy-px-2.5 tfy-font-mono"
          type="password"
          value={password}
          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter password"
          autoFocus
        />

        {state === "error" && (
          <div className="tfy-text-xs tfy-text-center tfy-mb-3 tfy-text-[#ff4f4f]">{error}</div>
        )}
        {state === "success" && (
          <div className="tfy-text-xs tfy-text-center tfy-mb-3 tfy-text-[#4f8cff]">Logged in successfully</div>
        )}

        <button
          className="tfy-w-full tfy-bg-[#4f8cff] tfy-text-white tfy-border-0 tfy-rounded-md tfy-text-[13px] tfy-font-semibold tfy-cursor-pointer tfy-py-[9px] tfy-font-mono"
          type="submit"
          disabled={state === "loading" || state === "success" || !user}
        >
          {BUTTON_LABEL[state]}
        </button>
      </form>
    </div>
  );
};

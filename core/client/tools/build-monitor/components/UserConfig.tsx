import React from "react";

interface Props {
  user: string;
  subscribed: string[];
  onAdd: (user: string) => void;
  onRemove: (user: string) => void;
  availableUsers: string[];
}

const labelClass = "tfy-block tfy-text-[10px] tfy-font-semibold tfy-uppercase tfy-text-muted tfy-mb-1 tfy-tracking-[0.5px]";

export const UserConfig: React.FC<Props> = ({ user, subscribed, onAdd, onRemove, availableUsers }) => {
  const subOptions = availableUsers.filter((u) => u !== user && !subscribed.includes(u));

  return (
    <>
      <div className="tfy-mb-3">
        <label className={labelClass}>User</label>
        <span className="tfy-text-text tfy-text-[13px]">{user || "—"}</span>
      </div>

      <div className="tfy-mb-3">
        <label className={labelClass}>Subscribed</label>
        <select
          className="tfy-w-full tfy-bg-input tfy-border tfy-border-border tfy-rounded tfy-text-text tfy-py-1.5 tfy-px-2 tfy-text-xs tfy-font-mono tfy-outline-none tfy-box-border"
          value=""
          onChange={(e) => { if (e.target.value) onAdd(e.target.value); }}
          disabled={subOptions.length === 0}
        >
          <option value="">{subOptions.length === 0 ? "No users available" : "Add user..."}</option>
          {subOptions.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="tfy-flex tfy-flex-wrap tfy-gap-1 tfy-mt-1.5">
          {subscribed.map((s) => (
            <span key={s} className="tfy-inline-flex tfy-items-center tfy-gap-1 tfy-bg-tag tfy-text-accent tfy-rounded tfy-py-0.5 tfy-px-2 tfy-text-[11px]">
              {s}
              <button onClick={() => onRemove(s)} className="tfy-bg-transparent tfy-border-0 tfy-text-muted tfy-cursor-pointer tfy-p-0 tfy-text-[13px] tfy-leading-none">
                ×
              </button>
            </span>
          ))}
          {subscribed.length === 0 && (
            <span className="tfy-text-muted tfy-text-[11px] tfy-italic">only your changes</span>
          )}
        </div>
      </div>
    </>
  );
};

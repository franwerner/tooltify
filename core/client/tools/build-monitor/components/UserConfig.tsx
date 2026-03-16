import React from "react";
import { styles, COLORS } from "../styles";

interface Props {
  user: string;
  subscribed: string[];
  onAdd: (user: string) => void;
  onRemove: (user: string) => void;
  availableUsers: string[];
}

export const UserConfig: React.FC<Props> = ({
  user,
  subscribed,
  onAdd,
  onRemove,
  availableUsers,
}) => {
  // Users available to subscribe (exclude self and already subscribed)
  const subOptions = availableUsers.filter(
    (u) => u !== user && !subscribed.includes(u)
  );

  return (
    <>
      <div style={styles.section}>
        <label style={styles.label}>User</label>
        <span style={{ color: COLORS.text, fontSize: 13 }}>{user || "—"}</span>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Subscribed</label>
        <select
          style={styles.input}
          value=""
          onChange={(e) => {
            if (e.target.value) onAdd(e.target.value);
          }}
          disabled={subOptions.length === 0}
        >
          <option value="">
            {subOptions.length === 0
              ? "No users available"
              : "Add user..."}
          </option>
          {subOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <div style={styles.tags}>
          {subscribed.map((s) => (
            <span key={s} style={styles.tag}>
              {s}
              <button
                onClick={() => onRemove(s)}
                style={styles.tagRemove}
              >
                ×
              </button>
            </span>
          ))}
          {subscribed.length === 0 && (
            <span style={styles.muted}>only your changes</span>
          )}
        </div>
      </div>
    </>
  );
};

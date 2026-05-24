import React, { useEffect } from "react";
import { SHORTCUTS, GROUPS } from "../../../shared/keybindings/shortcuts";

const labelClass = "tfy-text-[10px] tfy-font-semibold tfy-uppercase tfy-text-muted tfy-tracking-[0.5px] tfy-py-1 tfy-px-5";
const kbdClass = "tfy-inline-block tfy-bg-input tfy-border tfy-border-border tfy-rounded tfy-px-1.5 tfy-py-0.5 tfy-text-[10px] tfy-text-text tfy-whitespace-nowrap";

interface Props {
  onClose: () => void;
}

export const InfoPanel: React.FC<Props> = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      className="tfy-fixed tfy-inset-0 tfy-bg-black/60 tfy-z-[9999999] tfy-flex tfy-items-center tfy-justify-center tfy-font-mono tfy-backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="tfy-bg-[#1a1d23] tfy-border tfy-border-border tfy-rounded-xl tfy-w-[90%] tfy-max-w-[560px] tfy-max-h-[80vh] tfy-flex tfy-flex-col tfy-overflow-hidden tfy-shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tfy-flex tfy-justify-between tfy-items-center tfy-border-b tfy-border-border tfy-py-3 tfy-px-5">
          <span className="tfy-text-accent tfy-font-bold tfy-text-[13px]">Keyboard Shortcuts</span>
          <button className="tfy-bg-transparent tfy-border-0 tfy-text-muted tfy-cursor-pointer tfy-text-xl tfy-p-0 tfy-leading-none" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="tfy-overflow-auto tfy-flex-1 tfy-py-2">
          {GROUPS.map((group) => {
            const items = SHORTCUTS.filter((s) => s.groups.includes(group));
            if (items.length === 0) return null;
            return (
              <div key={group} className="tfy-mb-1">
                <div className={labelClass}>{group}</div>
                {items.map((s) => (
                  <div key={s.id} className="tfy-flex tfy-items-center tfy-gap-3 tfy-py-1 tfy-px-5 tfy-text-[11px]">
                    <span className="tfy-shrink-0 tfy-w-[120px]">
                      <span className={kbdClass}>{s.combo}</span>
                    </span>
                    <span className="tfy-text-muted">{s.desc}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

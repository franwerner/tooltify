import React from "react";

interface Props {
  message: string | null;
}

export const Toast: React.FC<Props> = ({ message }) =>
  message ? (
    <div className="tfy-fixed tfy-bottom-16 tfy-right-5 tfy-z-[9999999] tfy-bg-surface tfy-border tfy-border-border tfy-text-accent tfy-text-[11px] tfy-font-mono tfy-py-2 tfy-px-3 tfy-rounded-lg tfy-shadow-[0_4px_20px_rgba(0,0,0,0.4)] tfy-pointer-events-none tfy-max-w-[80vw] tfy-overflow-hidden tfy-text-ellipsis tfy-whitespace-nowrap">
      {message}
    </div>
  ) : null;

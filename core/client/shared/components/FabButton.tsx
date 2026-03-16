import React from "react";

export const FabButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  style,
  children,
  ...props
}) => (
  <button
    className={`tfy-fixed tfy-bottom-5 tfy-w-9 tfy-h-9 tfy-rounded-full tfy-bg-[rgba(22,27,34,0.95)] tfy-border tfy-border-solid tfy-border-[#30363d] tfy-cursor-pointer tfy-z-[999998] tfy-flex tfy-items-center tfy-justify-center tfy-shadow-[0_2px_12px_rgba(0,0,0,0.3)] tfy-p-0 tfy-transition-[border-color,color] tfy-duration-150 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </button>
);

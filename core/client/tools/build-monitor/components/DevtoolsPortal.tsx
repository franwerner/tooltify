import { useRef } from "react";
import { createPortal } from "react-dom";
import tailwindCss from "../../../styles/tailwind.css?inline";

const CONTAINER_ID = "devtools-portal-root";
const STYLE_ID = "tooltify-tw";

const getContainer = (): HTMLDivElement => {
  let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null;
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "0";
    container.style.height = "0";
    container.style.overflow = "visible";
    container.style.zIndex = "2147483647";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = tailwindCss;
    container.appendChild(style);
  }

  return container;
};

export const DevtoolsPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const elRef = useRef<HTMLDivElement>(getContainer());

  return createPortal(
    <div className="tfy-pointer-events-auto">{children}</div>,
    elRef.current
  );
};

import { useRef } from "react";
import { createPortal } from "react-dom";
import tailwindCss from "../../styles/tailwind.css?inline";

const CONTAINER_ID = "tooltify-lightdom-root";
const STYLE_ID = "tooltify-tw-lightdom";

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

// Portal en light DOM (fuera del shadow root) para Monaco, que no funciona
// confiable dentro de Shadow DOM. `all: revert` corta la herencia de CSS del
// host en el wrapper; las clases tfy- de Tailwind re-estilan en los descendientes.
export const LightDomPortal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const elRef = useRef<HTMLDivElement>(getContainer());

  return createPortal(
    // El container es pointer-events:none para no bloquear la página; se re-habilita
    // en el contenido para que el editor reciba scroll/clicks (pointer-events hereda,
    // así que `all: revert` por sí solo arrastra el `none` del container).
    <div style={{ all: "revert" }}>
      <div style={{ pointerEvents: "auto" }}>{children}</div>
    </div>,
    elRef.current
  );
};

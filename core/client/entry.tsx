import React from "react";
import { createRoot } from "react-dom/client";
import { ActiveToolProvider } from "./shared/components/ActiveToolContext";
import { AuthGate } from "./features/auth/AuthGate";
import { DevtoolsPanel } from "./tools/build-monitor";
import { DevtoolsPortal } from "./tools/build-monitor/components/DevtoolsPortal";
import { SourceTracker } from "./tools/tracker";
import { setDevtoolsShadowRoot } from "./shared/utils/devtoolsShadowRoot";

const Devtools: React.FC = () => (
  <AuthGate>
    <ActiveToolProvider>
      <DevtoolsPortal>
        <DevtoolsPanel />
        <SourceTracker />
      </DevtoolsPortal>
    </ActiveToolProvider>
  </AuthGate>
);

// Auto-mount when the script loads
const mount = () => {
  const host = document.createElement("div");
  host.id = "tooltify-host";
  document.body.appendChild(host);

  // Shadow root abierto: aísla el CSS del host de la UI de la devtools
  const shadow = host.attachShadow({ mode: "open" });
  setDevtoolsShadowRoot(shadow);

  const el = document.createElement("div");
  el.id = "devtools-root";
  shadow.appendChild(el);
  createRoot(el).render(<Devtools />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}

export { Devtools };

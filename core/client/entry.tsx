import React from "react";
import { createRoot } from "react-dom/client";
import { ActiveToolProvider } from "./shared/components/ActiveToolContext";
import { AuthGate } from "./features/auth/AuthGate";
import { DevtoolsPanel } from "./tools/build-monitor";
import { DevtoolsPortal } from "./tools/build-monitor/components/DevtoolsPortal";
import { SourceTracker } from "./tools/tracker";

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
  const el = document.createElement("div");
  el.id = "devtools-root";
  document.body.appendChild(el);
  createRoot(el).render(<Devtools />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}

export { Devtools };

import React, { useState } from "react";
import { useCommand } from "../../shared/keybindings/Keymap";
import { InfoFab } from "./components/InfoFab";
import { InfoPanel } from "./components/InfoPanel";

export const InfoTool: React.FC = () => {
  const [open, setOpen] = useState(false);

  useCommand("info.toggle", () => setOpen((v) => !v));

  return (
    <>
      <InfoFab active={open} onClick={() => setOpen((v) => !v)} />
      {open && <InfoPanel onClose={() => setOpen(false)} />}
    </>
  );
};

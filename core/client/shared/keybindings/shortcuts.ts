export interface KeyChord {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export type ShortcutKind = "key" | "hold" | "mouse";

export interface Shortcut {
  id: string;
  groups: string[];
  combo: string;
  desc: string;
  kind: ShortcutKind;
  // Solo kind "key": el dispatcher despacha estos chords a su command id.
  chord?: KeyChord;
  // Solo kind "hold": teclas que, mientras se mantienen, activan el estado.
  holdKeys?: string[];
}

export const GROUPS = [
  "Source Tracker",
  "Mini IDE",
  "Build Monitor",
  "Inspect Modal",
  "General",
] as const;

export const SHORTCUTS: Shortcut[] = [
  { id: "monitor.toggle", groups: ["Build Monitor"], combo: "Shift+F1", desc: "Toggle monitor panel", kind: "key", chord: { key: "F1", shift: true } },
  { id: "monitor.close", groups: ["Build Monitor"], combo: "Esc", desc: "Close", kind: "key" },

  { id: "tracker.toggleInspect", groups: ["Source Tracker"], combo: "Shift+F2", desc: "Toggle inspect mode", kind: "key", chord: { key: "F2", shift: true } },
  { id: "tracker.inspectElement", groups: ["Source Tracker"], combo: "Click", desc: "Inspect element (open modal)", kind: "mouse" },
  { id: "tracker.copyPath", groups: ["Source Tracker"], combo: "Alt+Click", desc: "Copy component path", kind: "mouse" },
  { id: "tracker.pause", groups: ["Source Tracker", "Mini IDE"], combo: "Ctrl (hold)", desc: "Pause — pass clicks through to the page", kind: "hold", holdKeys: ["Control", "Meta"] },
  { id: "tracker.exitInspect", groups: ["Source Tracker"], combo: "Esc", desc: "Exit inspect mode", kind: "key" },

  { id: "editor.toggle", groups: ["Mini IDE"], combo: "Shift+F3", desc: "Toggle editor pick mode", kind: "key", chord: { key: "F3", shift: true } },
  { id: "editor.pickElement", groups: ["Mini IDE"], combo: "Click", desc: "Open component in the editor", kind: "mouse" },
  { id: "editor.gotoImport", groups: ["Mini IDE"], combo: "Ctrl+Click", desc: "Go to import", kind: "mouse" },
  { id: "editor.close", groups: ["Mini IDE"], combo: "Esc", desc: "Close", kind: "key" },

  { id: "modal.openVscode", groups: ["Inspect Modal"], combo: "Ctrl+Click", desc: "Open path in VSCode", kind: "mouse" },
  { id: "modal.close", groups: ["Inspect Modal"], combo: "Esc", desc: "Close modal", kind: "key" },

  { id: "info.toggle", groups: ["General"], combo: "Shift+F4", desc: "Toggle this help", kind: "key", chord: { key: "F4", shift: true } },
  { id: "info.close", groups: ["General"], combo: "Esc", desc: "Close help", kind: "key" },
];

export const getHoldKeys = (id: string): string[] =>
  SHORTCUTS.find((s) => s.id === id)?.holdKeys ?? [];

# @tooltify/core

## 0.7.3

### Patch Changes

- 2be902a: Mini editor and session fixes: highlight Vue SFC files (Monarch tokenizer embedding html/js/ts/css per block), make the mini editor interactive inside the light-DOM portal, stop logging a false "open-source" error on success, and scope the session cookie per port so multiple localhost projects no longer drop each other's session.

## 0.7.2

### Patch Changes

- bae1069: Fix two devtools issues: tool FABs are now kept above modal backdrops so they stay clickable while a modal is open, and "open in editor" targets the active editor window (most recent live IPC socket) while resolving the remote-cli binary robustly from the server install.

## 0.7.1

### Patch Changes

- 23da81a: `tooltify start` can now override the editor on an existing session: it prompts for editor/remote (defaulting to the current values) without asking for the password again, and restarts the agent only when those settings actually change.

## 0.7.0

### Minor Changes

- 242b305: Group mode: several OS users on the same machine can now share a single project's tooltifyServer, each opening files in their own editor. The agent becomes a multi-connection client that dials every project server it has a token for, and the server routes editor commands per user.

  BREAKING: auth (salt/secret/users) moves from `~/.tooltify/config.json` to a gitignored `<project>/.tooltify/auth.json` (per-project), and `tooltify start` logs in against the project server. Existing setups must re-register with `tooltify start`.

## 0.6.0

### Minor Changes

- 209de2c: Global agent: the agent is now a single user-scoped socket.io server that every project server connects to, removing the one-agent-per-project limitation when running Tooltify across multiple projects at once.

  BREAKING: the `auth` block (salt/secret/users) is removed from the per-project `tooltify.config.json` and now lives in the global `~/.tooltify/config.json`. Existing projects must re-register with `tooltify start`.

## 0.5.0

### Minor Changes

- 306727c: Centralize `editorPathMap` remapping in the server. The server now applies the prefix remap on both paths it exposes: the `/editor/meta` root (so "copy path" returns the host path, not the container path) and the path sent to the agent for "open in editor". The agent-side remap is removed. No-op when `editorPathMap` is absent or the prefix doesn't match.

## 0.4.0

### Minor Changes

- 330e335: Add `editorPathMap` config to remap file paths before opening them in the editor. When the dev server runs inside a container (paths like `/app/src/...`) and the editor runs on the host (WSL/SSH/devcontainer), the agent rewrites the `from` prefix to `to` so "open in editor" resolves to the real host path.

## 0.3.0

### Minor Changes

- 1acfe7c: add tracker pause/copy shortcuts and a keyboard shortcuts panel

  Hold Ctrl to temporarily pause the inspect and editor-pick modes, and
  Alt+Click in inspect to copy a component path. Adds an info tool that
  lists every shortcut, sourced from a new centralized keybinding registry.

## 0.2.1

### Patch Changes

- e18dcc6: Isolate the embedded devtools UI from host app CSS using an open shadow root. Monaco/MiniEditor stays in a light-DOM portal (it loads from CDN and its head-injected CSS cannot cross the shadow boundary), guarded by a reset wrapper.

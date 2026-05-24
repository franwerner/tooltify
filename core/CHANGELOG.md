# @tooltify/core

## 0.3.0

### Minor Changes

- 1acfe7c: add tracker pause/copy shortcuts and a keyboard shortcuts panel

  Hold Ctrl to temporarily pause the inspect and editor-pick modes, and
  Alt+Click in inspect to copy a component path. Adds an info tool that
  lists every shortcut, sourced from a new centralized keybinding registry.

## 0.2.1

### Patch Changes

- e18dcc6: Isolate the embedded devtools UI from host app CSS using an open shadow root. Monaco/MiniEditor stays in a light-DOM portal (it loads from CDN and its head-injected CSS cannot cross the shadow boundary), guarded by a reset wrapper.

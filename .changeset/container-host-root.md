---
"@tooltify/core": patch
---

Derive `editorPathMap` from the `TOOLTIFY_HOST_ROOT` env when the server runs in a container, so consumers don't hardcode a per-machine host path. An explicit `editorPathMap` still takes precedence; without the env, paths are used as-is.

Also stop requiring the global config in `startServer` — the server never used it, and it broke booting in environments without `~/.tooltify/config.json` (containers, CI).

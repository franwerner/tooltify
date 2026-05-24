---
"@tooltify/core": minor
---

Add `editorPathMap` config to remap file paths before opening them in the editor. When the dev server runs inside a container (paths like `/app/src/...`) and the editor runs on the host (WSL/SSH/devcontainer), the agent rewrites the `from` prefix to `to` so "open in editor" resolves to the real host path.

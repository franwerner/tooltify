---
"@tooltify/core": minor
---

Centralize `editorPathMap` remapping in the server. The server now applies the prefix remap on both paths it exposes: the `/editor/meta` root (so "copy path" returns the host path, not the container path) and the path sent to the agent for "open in editor". The agent-side remap is removed. No-op when `editorPathMap` is absent or the prefix doesn't match.

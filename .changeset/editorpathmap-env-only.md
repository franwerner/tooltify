---
"@tooltify/core": patch
---

Make path remapping env-only: `editorPathMap` is no longer read from `tooltify.config.json`. The remap is derived solely from the `TOOLTIFY_HOST_ROOT` env (cwd → host root); any `editorPathMap` in the JSON is ignored. Without the env, no remap.

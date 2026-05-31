---
"@tooltify/core": patch
---

`tooltify start` can now override the editor on an existing session: it prompts for editor/remote (defaulting to the current values) without asking for the password again, and restarts the agent only when those settings actually change.

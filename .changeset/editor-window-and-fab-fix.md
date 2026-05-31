---
"@tooltify/core": patch
---

Fix two devtools issues: tool FABs are now kept above modal backdrops so they stay clickable while a modal is open, and "open in editor" targets the active editor window (most recent live IPC socket) while resolving the remote-cli binary robustly from the server install.

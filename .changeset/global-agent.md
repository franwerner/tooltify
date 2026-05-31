---
"@tooltify/core": minor
"@tooltify/integration-shared": minor
"@tooltify/integration-vite": minor
"@tooltify/integration-rspack": minor
---

Global agent: the agent is now a single user-scoped socket.io server that every project server connects to, removing the one-agent-per-project limitation when running Tooltify across multiple projects at once.

BREAKING: the `auth` block (salt/secret/users) is removed from the per-project `tooltify.config.json` and now lives in the global `~/.tooltify/config.json`. Existing projects must re-register with `tooltify start`.

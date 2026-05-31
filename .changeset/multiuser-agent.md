---
"@tooltify/core": minor
"@tooltify/integration-shared": minor
"@tooltify/integration-vite": minor
"@tooltify/integration-rspack": minor
---

Group mode: several OS users on the same machine can now share a single project's tooltifyServer, each opening files in their own editor. The agent becomes a multi-connection client that dials every project server it has a token for, and the server routes editor commands per user.

BREAKING: auth (salt/secret/users) moves from `~/.tooltify/config.json` to a gitignored `<project>/.tooltify/auth.json` (per-project), and `tooltify start` logs in against the project server. Existing setups must re-register with `tooltify start`.

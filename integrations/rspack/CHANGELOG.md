# @tooltify/integration-rspack

## 0.6.0

### Minor Changes

- 242b305: Group mode: several OS users on the same machine can now share a single project's tooltifyServer, each opening files in their own editor. The agent becomes a multi-connection client that dials every project server it has a token for, and the server routes editor commands per user.

  BREAKING: auth (salt/secret/users) moves from `~/.tooltify/config.json` to a gitignored `<project>/.tooltify/auth.json` (per-project), and `tooltify start` logs in against the project server. Existing setups must re-register with `tooltify start`.

### Patch Changes

- Updated dependencies [242b305]
  - @tooltify/core@0.7.0
  - @tooltify/integration-shared@0.6.0

## 0.5.0

### Minor Changes

- 209de2c: Global agent: the agent is now a single user-scoped socket.io server that every project server connects to, removing the one-agent-per-project limitation when running Tooltify across multiple projects at once.

  BREAKING: the `auth` block (salt/secret/users) is removed from the per-project `tooltify.config.json` and now lives in the global `~/.tooltify/config.json`. Existing projects must re-register with `tooltify start`.

### Patch Changes

- Updated dependencies [209de2c]
  - @tooltify/core@0.6.0
  - @tooltify/integration-shared@0.5.0

## 0.4.3

### Patch Changes

- Updated dependencies [306727c]
  - @tooltify/core@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies [330e335]
  - @tooltify/core@0.4.0

## 0.4.1

### Patch Changes

- Updated dependencies [1acfe7c]
  - @tooltify/core@0.3.0

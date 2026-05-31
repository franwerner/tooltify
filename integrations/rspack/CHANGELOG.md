# @tooltify/integration-rspack

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

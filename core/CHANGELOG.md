# @tooltify/core

## 0.2.1

### Patch Changes

- e18dcc6: Isolate the embedded devtools UI from host app CSS using an open shadow root. Monaco/MiniEditor stays in a light-DOM portal (it loads from CDN and its head-injected CSS cannot cross the shadow boundary), guarded by a reset wrapper.

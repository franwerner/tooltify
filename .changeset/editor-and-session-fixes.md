---
"@tooltify/core": patch
---

Mini editor and session fixes: highlight Vue SFC files (Monarch tokenizer embedding html/js/ts/css per block), make the mini editor interactive inside the light-DOM portal, stop logging a false "open-source" error on success, and scope the session cookie per port so multiple localhost projects no longer drop each other's session.

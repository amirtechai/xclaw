---
summary: "CLI reference for `xclaw reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `xclaw reset`

Reset local config/state (keeps the CLI installed).

```bash
xclaw backup create
xclaw reset
xclaw reset --dry-run
xclaw reset --scope config+creds+sessions --yes --non-interactive
```

Run `xclaw backup create` first if you want a restorable snapshot before removing local state.

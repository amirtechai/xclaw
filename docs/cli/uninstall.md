---
summary: "CLI reference for `xclaw uninstall` (remove gateway service + local data)"
read_when:
  - You want to remove the gateway service and/or local state
  - You want a dry-run first
title: "uninstall"
---

# `xclaw uninstall`

Uninstall the gateway service + local data (CLI remains).

```bash
xclaw backup create
xclaw uninstall
xclaw uninstall --all --yes
xclaw uninstall --dry-run
```

Run `xclaw backup create` first if you want a restorable snapshot before removing state or workspaces.

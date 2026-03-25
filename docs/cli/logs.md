---
summary: "CLI reference for `xclaw logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `xclaw logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
xclaw logs
xclaw logs --follow
xclaw logs --json
xclaw logs --limit 500
xclaw logs --local-time
xclaw logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.

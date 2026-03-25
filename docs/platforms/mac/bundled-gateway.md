---
summary: "Gateway runtime on macOS (external launchd service)"
read_when:
  - Packaging XClaw.app
  - Debugging the macOS gateway launchd service
  - Installing the gateway CLI for macOS
title: "Gateway on macOS"
---

# Gateway on macOS (external launchd)

XClaw.app no longer bundles Node/Bun or the Gateway runtime. The macOS app
expects an **external** `xclaw` CLI install, does not spawn the Gateway as a
child process, and manages a per‑user launchd service to keep the Gateway
running (or attaches to an existing local Gateway if one is already running).

## Install the CLI (required for local mode)

Node 24 is the default runtime on the Mac. Node 22 LTS, currently `22.16+`, still works for compatibility. Then install `xclaw` globally:

```bash
npm install -g xclaw@<version>
```

The macOS app’s **Install CLI** button runs the same flow via npm/pnpm (bun not recommended for Gateway runtime).

## Launchd (Gateway as LaunchAgent)

Label:

- `ai.xclaw.gateway` (or `ai.xclaw.<profile>`; legacy `com.xclaw.*` may remain)

Plist location (per‑user):

- `~/Library/LaunchAgents/ai.xclaw.gateway.plist`
  (or `~/Library/LaunchAgents/ai.xclaw.<profile>.plist`)

Manager:

- The macOS app owns LaunchAgent install/update in Local mode.
- The CLI can also install it: `xclaw gateway install`.

Behavior:

- “XClaw Active” enables/disables the LaunchAgent.
- App quit does **not** stop the gateway (launchd keeps it alive).
- If a Gateway is already running on the configured port, the app attaches to
  it instead of starting a new one.

Logging:

- launchd stdout/err: `/tmp/xclaw/xclaw-gateway.log`

## Version compatibility

The macOS app checks the gateway version against its own version. If they’re
incompatible, update the global CLI to match the app version.

## Smoke check

```bash
xclaw --version

XCLAW_SKIP_CHANNELS=1 \
XCLAW_SKIP_CANVAS_HOST=1 \
xclaw gateway --port 18999 --bind loopback
```

Then:

```bash
xclaw gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```

import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          XCLAW_STATE_DIR: "/tmp/xclaw-state",
          XCLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "xclaw-gateway",
        windowsTaskName: "XClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/xclaw-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/xclaw-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "xclaw-gateway",
        windowsTaskName: "XClaw Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u xclaw-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "xclaw-gateway",
        windowsTaskName: "XClaw Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "XClaw Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "xclaw gateway install",
        startCommand: "xclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.xclaw.gateway.plist",
        systemdServiceName: "xclaw-gateway",
        windowsTaskName: "XClaw Gateway",
      }),
    ).toEqual([
      "xclaw gateway install",
      "xclaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.xclaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "xclaw gateway install",
        startCommand: "xclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.xclaw.gateway.plist",
        systemdServiceName: "xclaw-gateway",
        windowsTaskName: "XClaw Gateway",
      }),
    ).toEqual([
      "xclaw gateway install",
      "xclaw gateway",
      "systemctl --user start xclaw-gateway.service",
    ]);
  });
});

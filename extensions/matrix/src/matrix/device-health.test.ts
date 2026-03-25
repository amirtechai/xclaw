import { describe, expect, it } from "vitest";
import { isXClawManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects XClaw-managed device names", () => {
    expect(isXClawManagedMatrixDevice("XClaw Gateway")).toBe(true);
    expect(isXClawManagedMatrixDevice("XClaw Debug")).toBe(true);
    expect(isXClawManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isXClawManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale XClaw-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "XClaw Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "XClaw Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "XClaw Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentXClawDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleXClawDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});

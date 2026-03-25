export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleXClawDevices: MatrixManagedDeviceInfo[];
  currentXClawDevices: MatrixManagedDeviceInfo[];
};

const XCLAW_DEVICE_NAME_PREFIX = "XClaw ";

export function isXClawManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(XCLAW_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const xClawDevices = devices.filter((device) =>
    isXClawManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleXClawDevices: xClawDevices.filter((device) => !device.current),
    currentXClawDevices: xClawDevices.filter((device) => device.current),
  };
}

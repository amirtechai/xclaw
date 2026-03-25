export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "xclaw/plugin-sdk/device-bootstrap";
export { definePluginEntry, type XClawPluginApi } from "xclaw/plugin-sdk/plugin-entry";
export { resolveGatewayBindUrl, resolveTailnetHostWithRunner } from "xclaw/plugin-sdk/core";
export {
  resolvePreferredXClawTmpDir,
  runPluginCommandWithTimeout,
} from "xclaw/plugin-sdk/sandbox";
export { renderQrPngBase64 } from "./qr-image.js";

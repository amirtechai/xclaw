// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export { definePluginEntry } from "./plugin-entry.js";
export type { XClawConfig } from "../config/config.js";
export { resolvePreferredXClawTmpDir } from "../infra/tmp-xclaw-dir.js";
export type {
  AnyAgentTool,
  XClawPluginApi,
  XClawPluginConfigSchema,
  XClawPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";

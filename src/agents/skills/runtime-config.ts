import { getRuntimeConfigSnapshot, type XClawConfig } from "../../config/config.js";

export function resolveSkillRuntimeConfig(config?: XClawConfig): XClawConfig | undefined {
  return getRuntimeConfigSnapshot() ?? config;
}

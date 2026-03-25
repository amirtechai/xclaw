import type { XClawConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: XClawConfig, pluginId: string): XClawConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}

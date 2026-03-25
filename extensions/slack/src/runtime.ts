import type { PluginRuntime } from "xclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "xclaw/plugin-sdk/runtime-store";

const { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Slack runtime not initialized");
export { getSlackRuntime, setSlackRuntime };

import type { PluginRuntime } from "xclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "xclaw/plugin-sdk/runtime-store";

const { setRuntime: setSignalRuntime, getRuntime: getSignalRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Signal runtime not initialized");
export { getSignalRuntime, setSignalRuntime };

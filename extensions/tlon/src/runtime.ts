import type { PluginRuntime } from "xclaw/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "xclaw/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Tlon runtime not initialized");
export { getTlonRuntime, setTlonRuntime };

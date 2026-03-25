import { definePluginEntry } from "xclaw/plugin-sdk/plugin-entry";
import type { AnyAgentTool, XClawPluginApi, XClawPluginToolFactory } from "./runtime-api.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default definePluginEntry({
  id: "lobster",
  name: "Lobster",
  description: "Optional local shell helper tools",
  register(api: XClawPluginApi) {
    api.registerTool(
      ((ctx) => {
        if (ctx.sandboxed) {
          return null;
        }
        return createLobsterTool(api) as AnyAgentTool;
      }) as XClawPluginToolFactory,
      { optional: true },
    );
  },
});

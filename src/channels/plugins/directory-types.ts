import type { XClawConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: XClawConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};

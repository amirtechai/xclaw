import { describe, expect, it } from "vitest";
import {
  ensureXClawExecMarkerOnProcess,
  markXClawExecEnv,
  XCLAW_CLI_ENV_VALUE,
  XCLAW_CLI_ENV_VAR,
} from "./xclaw-exec-env.js";

describe("markXClawExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", XCLAW_CLI: "0" };
    const marked = markXClawExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      XCLAW_CLI: XCLAW_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.XCLAW_CLI).toBe("0");
  });
});

describe("ensureXClawExecMarkerOnProcess", () => {
  it("mutates and returns the provided process env", () => {
    const env: NodeJS.ProcessEnv = { PATH: "/usr/bin" };

    expect(ensureXClawExecMarkerOnProcess(env)).toBe(env);
    expect(env[XCLAW_CLI_ENV_VAR]).toBe(XCLAW_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[XCLAW_CLI_ENV_VAR];
    delete process.env[XCLAW_CLI_ENV_VAR];

    try {
      expect(ensureXClawExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[XCLAW_CLI_ENV_VAR]).toBe(XCLAW_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[XCLAW_CLI_ENV_VAR];
      } else {
        process.env[XCLAW_CLI_ENV_VAR] = previous;
      }
    }
  });
});

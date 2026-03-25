import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "xclaw",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "xclaw", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "xclaw",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "xclaw",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "xclaw", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "xclaw", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "xclaw", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "xclaw", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "xclaw", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "xclaw", "status", "--deep"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "xclaw", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "xclaw", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "xclaw", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "xclaw", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "xclaw", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "xclaw", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".xclaw-dev");
    expect(env.XCLAW_PROFILE).toBe("dev");
    expect(env.XCLAW_STATE_DIR).toBe(expectedStateDir);
    expect(env.XCLAW_CONFIG_PATH).toBe(path.join(expectedStateDir, "xclaw.json"));
    expect(env.XCLAW_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      XCLAW_STATE_DIR: "/custom",
      XCLAW_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.XCLAW_STATE_DIR).toBe("/custom");
    expect(env.XCLAW_GATEWAY_PORT).toBe("19099");
    expect(env.XCLAW_CONFIG_PATH).toBe(path.join("/custom", "xclaw.json"));
  });

  it("uses XCLAW_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      XCLAW_HOME: "/srv/xclaw-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/xclaw-home");
    expect(env.XCLAW_STATE_DIR).toBe(path.join(resolvedHome, ".xclaw-work"));
    expect(env.XCLAW_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".xclaw-work", "xclaw.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "xclaw doctor --fix",
      env: {},
      expected: "xclaw doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "xclaw doctor --fix",
      env: { XCLAW_PROFILE: "default" },
      expected: "xclaw doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "xclaw doctor --fix",
      env: { XCLAW_PROFILE: "Default" },
      expected: "xclaw doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "xclaw doctor --fix",
      env: { XCLAW_PROFILE: "bad profile" },
      expected: "xclaw doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "xclaw --profile work doctor --fix",
      env: { XCLAW_PROFILE: "work" },
      expected: "xclaw --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "xclaw --dev doctor",
      env: { XCLAW_PROFILE: "dev" },
      expected: "xclaw --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("xclaw doctor --fix", { XCLAW_PROFILE: "work" })).toBe(
      "xclaw --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("xclaw doctor --fix", { XCLAW_PROFILE: "  jbxclaw  " })).toBe(
      "xclaw --profile jbxclaw doctor --fix",
    );
  });

  it("handles command with no args after xclaw", () => {
    expect(formatCliCommand("xclaw", { XCLAW_PROFILE: "test" })).toBe(
      "xclaw --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm xclaw doctor", { XCLAW_PROFILE: "work" })).toBe(
      "pnpm xclaw --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("xclaw gateway status --deep", { XCLAW_CONTAINER_HINT: "demo" }),
    ).toBe("xclaw --container demo gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("xclaw doctor", {
        XCLAW_CONTAINER_HINT: "demo",
        XCLAW_PROFILE: "work",
      }),
    ).toBe("xclaw --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("xclaw update", { XCLAW_CONTAINER_HINT: "demo" })).toBe(
      "xclaw update",
    );
    expect(
      formatCliCommand("pnpm xclaw update --channel beta", { XCLAW_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm xclaw update --channel beta");
  });
});

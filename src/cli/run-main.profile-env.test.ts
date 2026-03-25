import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dotenvState = vi.hoisted(() => {
  const state = {
    profileAtDotenvLoad: undefined as string | undefined,
    containerAtDotenvLoad: undefined as string | undefined,
  };
  return {
    state,
    loadDotEnv: vi.fn(() => {
      state.profileAtDotenvLoad = process.env.XCLAW_PROFILE;
      state.containerAtDotenvLoad = process.env.XCLAW_CONTAINER;
    }),
  };
});

const maybeRunCliInContainerMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => ({ handled: false, argv })),
);

vi.mock("./dotenv.js", () => ({
  loadCliDotEnv: dotenvState.loadDotEnv,
}));

vi.mock("../infra/env.js", () => ({
  normalizeEnv: vi.fn(),
}));

vi.mock("../infra/runtime-guard.js", () => ({
  assertSupportedRuntime: vi.fn(),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureXClawCliOnPath: vi.fn(),
}));

vi.mock("./route.js", () => ({
  tryRouteCli: vi.fn(async () => true),
}));

vi.mock("./windows-argv.js", () => ({
  normalizeWindowsArgv: (argv: string[]) => argv,
}));

vi.mock("./container-target.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./container-target.js")>();
  return {
    ...actual,
    maybeRunCliInContainer: maybeRunCliInContainerMock,
  };
});

import { runCli } from "./run-main.js";

describe("runCli profile env bootstrap", () => {
  const originalProfile = process.env.XCLAW_PROFILE;
  const originalStateDir = process.env.XCLAW_STATE_DIR;
  const originalConfigPath = process.env.XCLAW_CONFIG_PATH;
  const originalContainer = process.env.XCLAW_CONTAINER;
  const originalGatewayPort = process.env.XCLAW_GATEWAY_PORT;
  const originalGatewayUrl = process.env.XCLAW_GATEWAY_URL;
  const originalGatewayToken = process.env.XCLAW_GATEWAY_TOKEN;
  const originalGatewayPassword = process.env.XCLAW_GATEWAY_PASSWORD;

  beforeEach(() => {
    delete process.env.XCLAW_PROFILE;
    delete process.env.XCLAW_STATE_DIR;
    delete process.env.XCLAW_CONFIG_PATH;
    delete process.env.XCLAW_CONTAINER;
    delete process.env.XCLAW_GATEWAY_PORT;
    delete process.env.XCLAW_GATEWAY_URL;
    delete process.env.XCLAW_GATEWAY_TOKEN;
    delete process.env.XCLAW_GATEWAY_PASSWORD;
    dotenvState.state.profileAtDotenvLoad = undefined;
    dotenvState.state.containerAtDotenvLoad = undefined;
    dotenvState.loadDotEnv.mockClear();
    maybeRunCliInContainerMock.mockClear();
  });

  afterEach(() => {
    if (originalProfile === undefined) {
      delete process.env.XCLAW_PROFILE;
    } else {
      process.env.XCLAW_PROFILE = originalProfile;
    }
    if (originalContainer === undefined) {
      delete process.env.XCLAW_CONTAINER;
    } else {
      process.env.XCLAW_CONTAINER = originalContainer;
    }
    if (originalStateDir === undefined) {
      delete process.env.XCLAW_STATE_DIR;
    } else {
      process.env.XCLAW_STATE_DIR = originalStateDir;
    }
    if (originalConfigPath === undefined) {
      delete process.env.XCLAW_CONFIG_PATH;
    } else {
      process.env.XCLAW_CONFIG_PATH = originalConfigPath;
    }
    if (originalGatewayPort === undefined) {
      delete process.env.XCLAW_GATEWAY_PORT;
    } else {
      process.env.XCLAW_GATEWAY_PORT = originalGatewayPort;
    }
    if (originalGatewayUrl === undefined) {
      delete process.env.XCLAW_GATEWAY_URL;
    } else {
      process.env.XCLAW_GATEWAY_URL = originalGatewayUrl;
    }
    if (originalGatewayToken === undefined) {
      delete process.env.XCLAW_GATEWAY_TOKEN;
    } else {
      process.env.XCLAW_GATEWAY_TOKEN = originalGatewayToken;
    }
    if (originalGatewayPassword === undefined) {
      delete process.env.XCLAW_GATEWAY_PASSWORD;
    } else {
      process.env.XCLAW_GATEWAY_PASSWORD = originalGatewayPassword;
    }
  });

  it("applies --profile before dotenv loading", async () => {
    await runCli(["node", "xclaw", "--profile", "rawdog", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(dotenvState.state.profileAtDotenvLoad).toBe("rawdog");
    expect(process.env.XCLAW_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with --profile", async () => {
    await expect(
      runCli(["node", "xclaw", "--container", "demo", "--profile", "rawdog", "status"]),
    ).rejects.toThrow(
      "--container cannot be combined with --profile/--dev or gateway override env vars",
    );

    expect(dotenvState.loadDotEnv).not.toHaveBeenCalled();
    expect(process.env.XCLAW_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with interleaved --profile", async () => {
    await expect(
      runCli(["node", "xclaw", "status", "--container", "demo", "--profile", "rawdog"]),
    ).rejects.toThrow(
      "--container cannot be combined with --profile/--dev or gateway override env vars",
    );
  });

  it("rejects --container combined with interleaved --dev", async () => {
    await expect(
      runCli(["node", "xclaw", "status", "--container", "demo", "--dev"]),
    ).rejects.toThrow(
      "--container cannot be combined with --profile/--dev or gateway override env vars",
    );
  });

  it("does not let dotenv change container target resolution", async () => {
    dotenvState.loadDotEnv.mockImplementationOnce(() => {
      process.env.XCLAW_CONTAINER = "demo";
      dotenvState.state.profileAtDotenvLoad = process.env.XCLAW_PROFILE;
      dotenvState.state.containerAtDotenvLoad = process.env.XCLAW_CONTAINER;
    });

    await runCli(["node", "xclaw", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(process.env.XCLAW_CONTAINER).toBe("demo");
    expect(dotenvState.state.containerAtDotenvLoad).toBe("demo");
    expect(maybeRunCliInContainerMock).toHaveBeenCalledWith(["node", "xclaw", "status"]);
    expect(maybeRunCliInContainerMock).toHaveReturnedWith({
      handled: false,
      argv: ["node", "xclaw", "status"],
    });
  });

  it("rejects container mode when XCLAW_PROFILE is already set in env", async () => {
    process.env.XCLAW_PROFILE = "work";

    await expect(runCli(["node", "xclaw", "--container", "demo", "status"])).rejects.toThrow(
      "--container cannot be combined with --profile/--dev or gateway override env vars",
    );
  });

  it.each([
    ["XCLAW_GATEWAY_PORT", "19001"],
    ["XCLAW_GATEWAY_URL", "ws://127.0.0.1:18789"],
    ["XCLAW_GATEWAY_TOKEN", "demo-token"],
    ["XCLAW_GATEWAY_PASSWORD", "demo-password"],
  ])("rejects container mode when %s is set in env", async (key, value) => {
    process.env[key] = value;

    await expect(runCli(["node", "xclaw", "--container", "demo", "status"])).rejects.toThrow(
      "--container cannot be combined with --profile/--dev or gateway override env vars",
    );
  });

  it("allows container mode when only XCLAW_STATE_DIR is set in env", async () => {
    process.env.XCLAW_STATE_DIR = "/tmp/xclaw-host-state";

    await expect(
      runCli(["node", "xclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only XCLAW_CONFIG_PATH is set in env", async () => {
    process.env.XCLAW_CONFIG_PATH = "/tmp/xclaw-host-state/xclaw.json";

    await expect(
      runCli(["node", "xclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });
});

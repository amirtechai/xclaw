import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { XClawConfig } from "../config/config.js";
import { createEmptyPluginRegistry } from "../plugins/registry-empty.js";
import { resetPluginRuntimeStateForTest, setActivePluginRegistry } from "../plugins/runtime.js";
import type { SpeechProviderPlugin } from "../plugins/types.js";

const loadXClawPluginsMock = vi.fn();

vi.mock("../plugins/loader.js", () => ({
  loadXClawPlugins: (...args: Parameters<typeof loadXClawPluginsMock>) =>
    loadXClawPluginsMock(...args),
}));

let getSpeechProvider: typeof import("./provider-registry.js").getSpeechProvider;
let listSpeechProviders: typeof import("./provider-registry.js").listSpeechProviders;
let normalizeSpeechProviderId: typeof import("./provider-registry.js").normalizeSpeechProviderId;

function createSpeechProvider(id: string, aliases?: string[]): SpeechProviderPlugin {
  return {
    id,
    label: id,
    ...(aliases ? { aliases } : {}),
    isConfigured: () => true,
    synthesize: async () => ({
      audioBuffer: Buffer.from("audio"),
      outputFormat: "mp3",
      voiceCompatible: false,
      fileExtension: ".mp3",
    }),
  };
}

describe("speech provider registry", () => {
  beforeEach(async () => {
    vi.resetModules();
    resetPluginRuntimeStateForTest();
    loadXClawPluginsMock.mockReset();
    loadXClawPluginsMock.mockReturnValue(createEmptyPluginRegistry());
    ({ getSpeechProvider, listSpeechProviders, normalizeSpeechProviderId } =
      await import("./provider-registry.js"));
  });

  afterEach(() => {
    resetPluginRuntimeStateForTest();
  });

  it("uses active plugin speech providers without reloading plugins", () => {
    setActivePluginRegistry({
      ...createEmptyPluginRegistry(),
      speechProviders: [
        {
          pluginId: "test-openai",
          source: "test",
          provider: createSpeechProvider("openai"),
        },
      ],
    });

    const providers = listSpeechProviders();

    expect(providers.map((provider) => provider.id)).toEqual(["openai", "elevenlabs", "microsoft"]);
    expect(loadXClawPluginsMock).not.toHaveBeenCalled();
  });

  it("loads speech providers from plugins when config is provided", () => {
    loadXClawPluginsMock.mockReturnValue({
      ...createEmptyPluginRegistry(),
      speechProviders: [
        {
          pluginId: "test-microsoft",
          source: "test",
          provider: createSpeechProvider("microsoft", ["edge"]),
        },
      ],
    });

    const cfg = {} as XClawConfig;

    expect(listSpeechProviders(cfg).map((provider) => provider.id)).toEqual([
      "openai",
      "elevenlabs",
      "microsoft",
    ]);
    expect(getSpeechProvider("edge", cfg)?.id).toBe("microsoft");
    expect(loadXClawPluginsMock).toHaveBeenCalledWith({ config: cfg });
  });

  it("returns builtin providers when neither plugins nor active registry provide speech support", () => {
    expect(listSpeechProviders().map((provider) => provider.id)).toEqual([
      "openai",
      "elevenlabs",
      "microsoft",
    ]);
    expect(getSpeechProvider("openai")?.id).toBe("openai");
  });

  it("normalizes the legacy edge alias to microsoft", () => {
    expect(normalizeSpeechProviderId("edge")).toBe("microsoft");
  });
});

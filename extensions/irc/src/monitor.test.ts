import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#xclaw",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#xclaw",
      rawTarget: "#xclaw",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "xclaw-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "xclaw-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "xclaw-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "xclaw-bot",
      rawTarget: "xclaw-bot",
    });
  });
});

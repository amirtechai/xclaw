import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("xclaw", 16)).toBe("xclaw");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("xclaw-status-output", 10)).toBe("xclaw-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});

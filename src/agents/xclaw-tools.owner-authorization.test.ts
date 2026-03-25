import { describe, expect, it } from "vitest";
import "./test-helpers/fast-core-tools.js";
import { createXClawTools } from "./xclaw-tools.js";

function readToolByName() {
  return new Map(createXClawTools().map((tool) => [tool.name, tool]));
}

describe("createXClawTools owner authorization", () => {
  it("marks owner-only core tools in raw registration", () => {
    const tools = readToolByName();
    expect(tools.get("cron")?.ownerOnly).toBe(true);
    expect(tools.get("gateway")?.ownerOnly).toBe(true);
    expect(tools.get("nodes")?.ownerOnly).toBe(true);
  });

  it("keeps canvas non-owner-only in raw registration", () => {
    const tools = readToolByName();
    expect(tools.get("canvas")).toBeDefined();
    expect(tools.get("canvas")?.ownerOnly).not.toBe(true);
  });
});

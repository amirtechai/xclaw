import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "xclaw/plugin-sdk/command-auth";

type ListSkillCommandsForAgents =
  typeof import("xclaw/plugin-sdk/command-auth").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}

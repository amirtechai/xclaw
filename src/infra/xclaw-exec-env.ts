export const XCLAW_CLI_ENV_VAR = "XCLAW_CLI";
export const XCLAW_CLI_ENV_VALUE = "1";

export function markXClawExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [XCLAW_CLI_ENV_VAR]: XCLAW_CLI_ENV_VALUE,
  };
}

export function ensureXClawExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[XCLAW_CLI_ENV_VAR] = XCLAW_CLI_ENV_VALUE;
  return env;
}

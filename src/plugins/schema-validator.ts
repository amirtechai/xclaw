import { createRequire } from "node:module";
import type { ErrorObject, ValidateFunction } from "ajv";
import { appendAllowedValuesHint, summarizeAllowedValues } from "../config/allowed-values.js";
import { sanitizeTerminalText } from "../terminal/safe-text.js";

const require = createRequire(import.meta.url);
type AjvLike = {
  compile: (schema: Record<string, unknown>) => ValidateFunction;
};
let ajvSingleton: AjvLike | null = null;

function getAjv(): AjvLike {
  if (ajvSingleton) {
    return ajvSingleton;
  }
  const ajvModule = require("ajv") as { default?: new (opts?: object) => AjvLike };
  const AjvCtor =
    typeof ajvModule.default === "function"
      ? ajvModule.default
      : (ajvModule as unknown as new (opts?: object) => AjvLike);
  ajvSingleton = new AjvCtor({
    allErrors: true,
    strict: false,
    removeAdditional: false,
  });
  return ajvSingleton;
}

type CachedValidator = {
  validate: ValidateFunction;
  schema: Record<string, unknown>;
};

const schemaCache = new Map<string, CachedValidator>();

export type JsonSchemaValidationError = {
  path: string;
  message: string;
  text: string;
  allowedValues?: string[];
  allowedValuesHiddenCount?: number;
};

function normalizeAjvPath(instancePath: string | undefined): string {
  const path = instancePath?.replace(/^\//, "").replace(/\//g, ".");
  return path && path.length > 0 ? path : "<root>";
}

function appendPathSegment(path: string, segment: string): string {
  const trimmed = segment.trim();
  if (!trimmed) {
    return path;
  }
  if (path === "<root>") {
    return trimmed;
  }
  return `${path}.${trimmed}`;
}

function resolveMissingProperty(error: ErrorObject): string | null {
  if (
    error.keyword !== "required" &&
    error.keyword !== "dependentRequired" &&
    error.keyword !== "dependencies"
  ) {
    return null;
  }
  const missingProperty = (error.params as { missingProperty?: unknown }).missingProperty;
  return typeof missingProperty === "string" && missingProperty.trim() ? missingProperty : null;
}

function resolveAjvErrorPath(error: ErrorObject): string {
  const basePath = normalizeAjvPath(error.instancePath);
  const missingProperty = resolveMissingProperty(error);
  if (!missingProperty) {
    return basePath;
  }
  return appendPathSegment(basePath, missingProperty);
}

function extractAllowedValues(error: ErrorObject): unknown[] | null {
  if (error.keyword === "enum") {
    const allowedValues = (error.params as { allowedValues?: unknown }).allowedValues;
    return Array.isArray(allowedValues) ? allowedValues : null;
  }

  if (error.keyword === "const") {
    const params = error.params as { allowedValue?: unknown };
    if (!Object.prototype.hasOwnProperty.call(params, "allowedValue")) {
      return null;
    }
    return [params.allowedValue];
  }

  return null;
}

function getAjvAllowedValuesSummary(error: ErrorObject): ReturnType<typeof summarizeAllowedValues> {
  const allowedValues = extractAllowedValues(error);
  if (!allowedValues) {
    return null;
  }
  return summarizeAllowedValues(allowedValues);
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): JsonSchemaValidationError[] {
  if (!errors || errors.length === 0) {
    return [{ path: "<root>", message: "invalid config", text: "<root>: invalid config" }];
  }
  return errors.map((error) => {
    const path = resolveAjvErrorPath(error);
    const baseMessage = error.message ?? "invalid";
    const allowedValuesSummary = getAjvAllowedValuesSummary(error);
    const message = allowedValuesSummary
      ? appendAllowedValuesHint(baseMessage, allowedValuesSummary)
      : baseMessage;
    const safePath = sanitizeTerminalText(path);
    const safeMessage = sanitizeTerminalText(message);
    return {
      path,
      message,
      text: `${safePath}: ${safeMessage}`,
      ...(allowedValuesSummary
        ? {
            allowedValues: allowedValuesSummary.values,
            allowedValuesHiddenCount: allowedValuesSummary.hiddenCount,
          }
        : {}),
    };
  });
}

export function validateJsonSchemaValue(params: {
  schema: Record<string, unknown>;
  cacheKey: string;
  value: unknown;
}): { ok: true } | { ok: false; errors: JsonSchemaValidationError[] } {
  let cached = schemaCache.get(params.cacheKey);
  if (!cached || cached.schema !== params.schema) {
    const validate = getAjv().compile(params.schema);
    cached = { validate, schema: params.schema };
    schemaCache.set(params.cacheKey, cached);
  }

  const ok = cached.validate(params.value);
  if (ok) {
    return { ok: true };
  }
  return { ok: false, errors: formatAjvErrors(cached.validate.errors) };
}

/**
 * System paths that plugins must never claim fs write or root access to.
 * Any plugin declaring permissions for these paths is rejected as unsafe.
 */
const FORBIDDEN_FS_SYSTEM_PATHS = [
  "/",
  "/bin",
  "/boot",
  "/dev",
  "/etc",
  "/lib",
  "/lib64",
  "/opt",
  "/proc",
  "/root",
  "/run",
  "/sbin",
  "/sys",
  "/usr",
  "/var",
];

function isSystemPath(p: string): boolean {
  const normalized = p.replace(/\/+$/, "").toLowerCase();
  return FORBIDDEN_FS_SYSTEM_PATHS.some(
    (forbidden) => normalized === forbidden || normalized.startsWith(forbidden + "/"),
  );
}

export type PluginFsPermissionViolation = {
  field: string;
  value: string;
  reason: string;
};

/**
 * Validates that a plugin manifest does not claim filesystem permissions
 * (fs.root or fs.write) for system paths outside its sandbox.
 *
 * Returns an array of violations. An empty array means the manifest is clean.
 */
export function checkPluginFsPermissions(
  manifest: Record<string, unknown>,
): PluginFsPermissionViolation[] {
  const violations: PluginFsPermissionViolation[] = [];
  const permissions = manifest.permissions;
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
    return violations;
  }
  const perms = permissions as Record<string, unknown>;
  const fs = perms.fs;
  if (!fs || typeof fs !== "object" || Array.isArray(fs)) {
    return violations;
  }
  const fsPerms = fs as Record<string, unknown>;

  const checkPath = (field: string, value: unknown) => {
    if (typeof value !== "string" || !value.trim()) return;
    if (isSystemPath(value.trim())) {
      violations.push({
        field,
        value: value.trim(),
        reason: `Plugin claims ${field} access to system path "${value.trim()}" which is outside its sandbox`,
      });
    }
  };

  // Check fs.root
  checkPath("permissions.fs.root", fsPerms.root);

  // Check fs.write — can be a string or an array of strings
  if (Array.isArray(fsPerms.write)) {
    for (const entry of fsPerms.write) {
      checkPath("permissions.fs.write[]", entry);
    }
  } else {
    checkPath("permissions.fs.write", fsPerms.write);
  }

  return violations;
}

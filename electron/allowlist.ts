import { realpathSync } from "node:fs";

const allowed = new Set<string>();

/** Registers a user-opened path; returns the resolved real path. */
export function allowPath(path: string): string {
  const real = realpathSync(path);
  allowed.add(real);
  return real;
}

export function isAllowed(path: string): boolean {
  try {
    return allowed.has(realpathSync(path));
  } catch {
    return false;
  }
}

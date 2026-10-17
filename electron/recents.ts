import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { basename } from "node:path";
import type { RecentFile } from "../shared/types";

const MAX = 12;
const file = () => join(app.getPath("userData"), "recents.json");

export function getRecents(): RecentFile[] {
  try {
    const list = JSON.parse(readFileSync(file(), "utf8")) as RecentFile[];
    return list.filter((r) => existsSync(r.path));
  } catch {
    return [];
  }
}

export function addRecent(path: string): void {
  const rest = getRecents().filter((r) => r.path !== path);
  const next = [{ path, name: basename(path), openedAt: Date.now() }, ...rest].slice(0, MAX);
  try { writeFileSync(file(), JSON.stringify(next)); } catch { /* non-fatal */ }
}

export function isRecent(path: string): boolean {
  return getRecents().some((r) => r.path === path);
}

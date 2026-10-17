import type { MediaInfo } from "../types/player";

const KEY = "babu.positions";
const MAX_ENTRIES = 200;

type Positions = Record<string, { t: number; at: number }>;

const keyOf = (i: MediaInfo) => `${i.path}|${i.sizeBytes}`;

function read(): Positions {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Positions; } catch { return {}; }
}

export function loadPosition(info: MediaInfo): number {
  const t = read()[keyOf(info)]?.t ?? 0;
  return t > 5 && t < info.durationSec - 10 ? t : 0;
}

export function savePosition(info: MediaInfo, t: number): void {
  const all = read();
  if (t < 5 || t > info.durationSec - 10) delete all[keyOf(info)];
  else all[keyOf(info)] = { t, at: Date.now() };
  const keys = Object.keys(all).sort((a, b) => all[b].at - all[a].at).slice(0, MAX_ENTRIES);
  const trimmed: Positions = {};
  keys.forEach((k) => (trimmed[k] = all[k]));
  try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch { /* quota */ }
}

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { buildSubtitleArgs } from "./ffmpegArgs";
import { ffmpegPath } from "./binaries";
import { spawnTracked } from "./processes";
import { CACHE_ROOT } from "./session";

export function extractSubtitle(
  input: string, ordinal: number, startSec: number,
): Promise<string> {
  mkdirSync(CACHE_ROOT, { recursive: true });
  const dir = mkdtempSync(join(CACHE_ROOT, "sub-"));
  const out = join(dir, "sub.vtt");
  return new Promise((resolve, reject) => {
    const child = spawnTracked(ffmpegPath(), buildSubtitleArgs(input, ordinal, startSec, out));
    const cleanup = () => rmSync(dir, { recursive: true, force: true });
    child.on("error", (e) => { cleanup(); reject(e); });
    child.on("exit", (code) => {
      try {
        if (code !== 0) throw new Error("Could not extract subtitles");
        resolve(readFileSync(out, "utf8"));
      } catch (e) {
        reject(e);
      } finally {
        cleanup();
      }
    });
  });
}

import { mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { ChildProcess } from "node:child_process";
import type { MediaInfo } from "../../shared/types";
import { ENCODER_FALLBACKS, buildStreamArgs } from "./ffmpegArgs";
import { ffmpegPath } from "./binaries";
import { killProcess, spawnTracked } from "./processes";

export const CACHE_ROOT = join(tmpdir(), "babu-video-player-cache");

export class StreamSession {
  readonly id = randomUUID();
  readonly dir = join(CACHE_ROOT, this.id);
  readonly file = join(this.dir, "out.mp4");
  done = false;
  private proc: ChildProcess | null = null;
  private stopped = false;
  private encoderIdx = 0;
  private stderr = "";

  constructor(
    readonly info: MediaInfo,
    readonly startSec: number,
    readonly audioOrdinal: number,
  ) {
    mkdirSync(this.dir, { recursive: true });
  }

  bytesWritten(): number {
    try { return statSync(this.file).size; } catch { return 0; }
  }

  /** Resolves once data is flowing, rejects if every encoder fails. */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const launch = () => {
        const args = buildStreamArgs(this.info, {
          input: this.info.path, output: this.file, startSec: this.startSec,
          audioOrdinal: this.audioOrdinal, encoder: ENCODER_FALLBACKS[this.encoderIdx],
        });
        const child = spawnTracked(ffmpegPath(), args);
        this.proc = child;
        this.stderr = "";
        child.stderr?.on("data", (d) => (this.stderr += String(d)));
        const poll = setInterval(() => {
          if (this.bytesWritten() > 0) { clearInterval(poll); resolve(); }
        }, 40);
        child.on("error", (e) => { clearInterval(poll); this.done = true; reject(e); });
        child.on("exit", (code) => {
          clearInterval(poll);
          if (this.stopped) return;
          const ok = code === 0;
          if (!ok && this.bytesWritten() === 0 && this.encoderIdx < ENCODER_FALLBACKS.length - 1) {
            this.encoderIdx++;
            return launch();
          }
          this.done = true;
          if (this.bytesWritten() > 0) resolve();
          else reject(new Error(this.stderr.trim().split("\n").pop() || "ffmpeg failed"));
        });
      };
      launch();
    });
  }

  dispose(): void {
    this.stopped = true;
    this.done = true;
    killProcess(this.proc);
    rmSync(this.dir, { recursive: true, force: true });
  }
}

export function cleanCacheRoot(): void {
  rmSync(CACHE_ROOT, { recursive: true, force: true });
}

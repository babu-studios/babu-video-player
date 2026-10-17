import type { MediaInfo, PlaybackPlan } from "../shared/types";
import { allowPath } from "./allowlist";
import { addRecent } from "./recents";
import { isRemuxOnly } from "./media/ffmpegArgs";
import { nativeMime } from "./media/formats";
import { keyframeBefore, probeFile } from "./media/probe";
import { StreamSession } from "./media/session";
import { extractSubtitle } from "./media/subtitles";

let info: MediaInfo | null = null;
let session: StreamSession | null = null;

export function getStream(id: string): StreamSession | null {
  return session && session.id === id ? session : null;
}

function disposeSession(): void {
  session?.dispose();
  session = null;
}

async function transcodePlan(startSec: number, audioOrdinal: number): Promise<PlaybackPlan> {
  if (!info) throw new Error("No file open");
  disposeSession();
  const start = isRemuxOnly(info) && startSec > 0 ? await keyframeBefore(info, startSec) : startSec;
  disposeSession();
  const next = new StreamSession(info, start, audioOrdinal);
  session = next;
  try {
    await next.start();
  } catch (e) {
    if (session === next) disposeSession();
    throw new Error(`This file could not be converted (${(e as Error).message})`);
  }
  return {
    info, mode: "transcode", url: `babu-video-player://stream/${next.id}`,
    mime: "video/mp4", startOffset: start, audioOrdinal, remuxOnly: isRemuxOnly(info),
  };
}

export async function openMedia(path: string): Promise<PlaybackPlan> {
  const real = allowPath(path);
  const probed = await probeFile(real);
  disposeSession();
  info = probed;
  addRecent(real);
  const mime = nativeMime(probed);
  if (!mime) return transcodePlan(0, 0);
  return {
    info: probed, mode: "native", mime, startOffset: 0, audioOrdinal: 0, remuxOnly: false,
    url: `babu-video-player://file/${encodeURIComponent(real)}`,
  };
}

export const restartStream = transcodePlan;

export function subtitleFor(ordinal: number, offsetSec: number): Promise<string> {
  if (!info) return Promise.reject(new Error("No file open"));
  return extractSubtitle(info.path, ordinal, offsetSec);
}

export function closeMedia(): void {
  disposeSession();
  info = null;
}

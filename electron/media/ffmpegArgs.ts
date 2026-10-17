import type { MediaInfo } from "../../shared/types";
import { canRemuxVideo } from "./formats";

export type VideoEncoder = "h264_videotoolbox" | "libx264";
export const ENCODER_FALLBACKS: VideoEncoder[] = ["h264_videotoolbox", "libx264"];

export interface StreamOptions {
  input: string;
  output: string;
  startSec: number;
  audioOrdinal: number;
  encoder: VideoEncoder;
}

export function targetBitrate(info: MediaInfo): number {
  const src = info.bitrate || 4_000_000;
  return Math.min(Math.max(src, 2_000_000), 12_000_000);
}

export function isRemuxOnly(info: MediaInfo): boolean {
  return canRemuxVideo(info);
}

function videoArgs(info: MediaInfo, encoder: VideoEncoder): string[] {
  if (isRemuxOnly(info)) return ["-c:v", "copy"];
  const common = ["-pix_fmt", "yuv420p", "-b:v", String(targetBitrate(info))];
  if (encoder === "h264_videotoolbox") {
    return ["-c:v", encoder, "-realtime", "1", "-allow_sw", "1", ...common];
  }
  return ["-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency", ...common];
}

function audioArgs(info: MediaInfo, ordinal: number): string[] {
  const track = info.audioTracks.find((t) => t.ordinal === ordinal);
  if (!track) return ["-an"];
  const map = ["-map", `0:a:${ordinal}`];
  if (track.codec === "aac" && track.channels <= 2) return [...map, "-c:a", "copy"];
  return [...map, "-c:a", "aac", "-b:a", "192k", "-ac", "2"];
}

/** Fragmented MP4 so the file is playable while it is still being written. */
export function buildStreamArgs(info: MediaInfo, o: StreamOptions): string[] {
  const seek = o.startSec > 0 ? ["-ss", o.startSec.toFixed(3)] : [];
  return [
    "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
    ...seek, "-i", o.input,
    "-map", "0:v:0", ...videoArgs(info, o.encoder),
    ...audioArgs(info, o.audioOrdinal),
    "-sn", "-dn",
    "-movflags", "frag_keyframe+empty_moov+default_base_moof",
    "-f", "mp4", o.output,
  ];
}

export function buildSubtitleArgs(
  input: string, ordinal: number, startSec: number, output: string,
): string[] {
  const seek = startSec > 0 ? ["-ss", startSec.toFixed(3)] : [];
  return [
    "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
    ...seek, "-i", input,
    "-map", `0:s:${ordinal}`, "-c:s", "webvtt", "-f", "webvtt", output,
  ];
}

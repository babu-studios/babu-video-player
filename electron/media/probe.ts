import { execFile } from "node:child_process";
import { statSync } from "node:fs";
import { basename } from "node:path";
import type { MediaInfo } from "../../shared/types";
import { extensionOf, isTextSubtitle } from "./formats";
import { ffprobePath } from "./binaries";

interface RawStream {
  codec_type?: string; codec_name?: string; profile?: string; pix_fmt?: string;
  width?: number; height?: number; avg_frame_rate?: string; r_frame_rate?: string;
  channels?: number; tags?: Record<string, string>;
  disposition?: { attached_pic?: number };
}
export interface RawProbe {
  streams?: RawStream[];
  format?: { format_name?: string; duration?: string; start_time?: string; bit_rate?: string };
}

function parseRate(rate?: string): number {
  if (!rate) return 0;
  const [n, d] = rate.split("/").map(Number);
  return d ? n / d : n || 0;
}

export function parseProbe(raw: RawProbe, path: string, sizeBytes = 0): MediaInfo {
  const streams = raw.streams ?? [];
  const video = streams.find(
    (s) => s.codec_type === "video" && !s.disposition?.attached_pic,
  );
  if (!video) throw new Error("No video stream found");
  const audio = streams.filter((s) => s.codec_type === "audio");
  const subs = streams.filter((s) => s.codec_type === "subtitle");
  const lang = (s: RawStream) => s.tags?.language ?? "und";
  return {
    path,
    name: basename(path),
    container: raw.format?.format_name ?? extensionOf(path),
    sizeBytes,
    durationSec: Number(raw.format?.duration) || 0,
    startTime: Number(raw.format?.start_time) || 0,
    bitrate: Number(raw.format?.bit_rate) || 0,
    videoCodec: video.codec_name ?? "unknown",
    profile: video.profile ?? "",
    pixFmt: video.pix_fmt ?? "",
    width: video.width ?? 0,
    height: video.height ?? 0,
    fps: parseRate(video.avg_frame_rate) || parseRate(video.r_frame_rate),
    audioTracks: audio.map((s, i) => ({
      ordinal: i, codec: s.codec_name ?? "unknown", language: lang(s),
      title: s.tags?.title ?? "", channels: s.channels ?? 2,
    })),
    subtitleTracks: subs
      .map((s, i) => ({
        ordinal: i, codec: s.codec_name ?? "unknown", language: lang(s),
        title: s.tags?.title ?? "",
      }))
      .filter((t) => isTextSubtitle(t.codec)),
  };
}

export function probeFile(path: string): Promise<MediaInfo> {
  const args = ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", path];
  return new Promise((resolve, reject) => {
    execFile(ffprobePath(), args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(new Error("Could not read this file"));
      try {
        resolve(parseProbe(JSON.parse(stdout), path, statSync(path).size));
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Could not read this file"));
      }
    });
  });
}

/** Stream-copy seeks land on the keyframe at or before `t`; returns that time. */
export function keyframeBefore(info: MediaInfo, t: number): Promise<number> {
  const args = [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts_time",
    "-of", "csv=p=0", "-read_intervals", `${t}%+#1`, info.path,
  ];
  return new Promise((resolve) => {
    execFile(ffprobePath(), args, (err, stdout) => {
      const pts = Number(stdout.split("\n")[0]);
      resolve(err || !Number.isFinite(pts) ? t : Math.max(0, Math.min(t, pts - info.startTime)));
    });
  });
}

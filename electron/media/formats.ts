import type { MediaInfo } from "../../shared/types";

export const SUPPORTED_EXTENSIONS = [
  "mp4", "m4v", "mov", "mkv", "webm", "avi", "wmv", "flv",
  "ts", "mts", "m2ts", "mpeg", "mpg", "3gp", "hevc", "h265", "av1", "ogv",
];

export function extensionOf(path: string): string {
  const m = /\.([^./\\]+)$/.exec(path);
  return m ? m[1].toLowerCase() : "";
}

export function isSupportedExtension(path: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(extensionOf(path));
}

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", mov: "video/mp4", webm: "video/webm",
  ogv: "video/ogg", vtt: "text/vtt",
};

export function mimeForPath(path: string): string {
  return MIME_BY_EXT[extensionOf(path)] ?? "application/octet-stream";
}

const VIDEO_CODEC_TAGS: Record<string, string> = {
  h264: "avc1.64001f", vp8: "vp8", vp9: "vp09.00.10.08",
  av1: "av01.0.05M.08", hevc: "hvc1.1.6.L93.B0",
};
const AUDIO_CODEC_TAGS: Record<string, string> = {
  aac: "mp4a.40.2", mp3: "mp3", opus: "opus", vorbis: "vorbis", flac: "flac",
};

const NATIVE_CONTAINERS = ["mp4", "m4v", "mov", "webm"];

/** MIME string (with codecs) handed to canPlayType; "" if not a native candidate. */
export function nativeMime(info: MediaInfo): string {
  const ext = extensionOf(info.path);
  if (!NATIVE_CONTAINERS.includes(ext)) return "";
  if (info.audioTracks.length > 1) return "";
  const v = VIDEO_CODEC_TAGS[info.videoCodec];
  if (!v) return "";
  const codecs = [v];
  const audio = info.audioTracks[0];
  if (audio) {
    const a = AUDIO_CODEC_TAGS[audio.codec];
    if (!a) return "";
    codecs.push(a);
  }
  if (info.pixFmt && info.pixFmt !== "yuv420p") return "";
  return `${mimeForPath(info.path)}; codecs="${codecs.join(", ")}"`;
}

/** H.264 8-bit 4:2:0 can be remuxed with -c copy and still play in Chromium. */
export function canRemuxVideo(info: MediaInfo): boolean {
  return info.videoCodec === "h264" && (!info.pixFmt || info.pixFmt === "yuv420p");
}

export function isTextSubtitle(codec: string): boolean {
  return ["subrip", "srt", "ass", "ssa", "webvtt", "mov_text", "text"].includes(codec);
}

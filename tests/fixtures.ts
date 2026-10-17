import type { MediaInfo } from "../shared/types";

export function makeInfo(over: Partial<MediaInfo> = {}): MediaInfo {
  return {
    path: "/v/a.mp4", name: "a.mp4", container: "mov,mp4", sizeBytes: 1000,
    durationSec: 60, startTime: 0, bitrate: 4_000_000, videoCodec: "h264", profile: "High",
    pixFmt: "yuv420p", width: 1920, height: 1080, fps: 30,
    audioTracks: [{ ordinal: 0, codec: "aac", language: "eng", title: "", channels: 2 }],
    subtitleTracks: [], ...over,
  };
}

export interface AudioTrack {
  ordinal: number;
  codec: string;
  language: string;
  title: string;
  channels: number;
}

export interface SubtitleTrack {
  ordinal: number;
  codec: string;
  language: string;
  title: string;
}

export interface MediaInfo {
  path: string;
  name: string;
  container: string;
  sizeBytes: number;
  durationSec: number;
  startTime: number;
  bitrate: number;
  videoCodec: string;
  profile: string;
  pixFmt: string;
  width: number;
  height: number;
  fps: number;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
}

export type PlaybackMode = "native" | "transcode";

export interface PlaybackPlan {
  info: MediaInfo;
  mode: PlaybackMode;
  url: string;
  mime: string;
  startOffset: number;
  audioOrdinal: number;
  remuxOnly: boolean;
}

export interface RecentFile {
  path: string;
  name: string;
  openedAt: number;
}

export interface BabuBridge {
  openDialog(): Promise<PlaybackPlan | null>;
  openDropped(path: string): Promise<PlaybackPlan>;
  openRecent(path: string): Promise<PlaybackPlan>;
  restart(startSec: number, audioOrdinal: number): Promise<PlaybackPlan>;
  forceTranscode(startSec: number): Promise<PlaybackPlan>;
  getSubtitle(ordinal: number, offsetSec: number): Promise<string>;
  getRecents(): Promise<RecentFile[]>;
  reveal(path: string): void;
  setPlaying(playing: boolean): void;
  closeMedia(): void;
  pathForFile(file: File): string;
  onPlan(cb: (plan: PlaybackPlan) => void): () => void;
  onError(cb: (message: string) => void): () => void;
  ready(): void;
}

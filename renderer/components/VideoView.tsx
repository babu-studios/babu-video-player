import type { RefObject } from "react";
import type { PlaybackPlan } from "../types/player";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  plan: PlaybackPlan;
  initialTime: number;
  subtitleUrl: string | null;
  onToggle: () => void;
  onFullscreen: () => void;
  onError: (absTime: number) => void;
}

export function VideoView({ videoRef, plan, initialTime, subtitleUrl, onToggle, onFullscreen, onError }: Props) {
  return (
    <video
      key={plan.url} ref={videoRef} src={plan.url} className="video" autoPlay
      onClick={onToggle} onDoubleClick={onFullscreen}
      onLoadedMetadata={(e) => { if (initialTime > 0) e.currentTarget.currentTime = initialTime; }}
      onError={(e) => onError(plan.startOffset + e.currentTarget.currentTime)}
    >
      {subtitleUrl && <track key={subtitleUrl} kind="subtitles" src={subtitleUrl} default />}
    </video>
  );
}

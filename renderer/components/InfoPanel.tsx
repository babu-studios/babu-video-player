import type { PlaybackPlan } from "../types/player";
import { formatBitrate, formatBytes, formatTime } from "../utils/format";

interface Props {
  plan: PlaybackPlan;
  onClose: () => void;
}

export function InfoPanel({ plan, onClose }: Props) {
  const i = plan.info;
  const engine = plan.mode === "native" ? "Native" : plan.remuxOnly ? "ffmpeg (remux)" : "ffmpeg (transcode)";
  const rows: [string, string][] = [
    ["Name", i.name],
    ["Container", i.container],
    ["Video codec", `${i.videoCodec}${i.profile ? ` (${i.profile})` : ""}`],
    ["Resolution", `${i.width}×${i.height}`],
    ["Frame rate", i.fps ? `${i.fps.toFixed(2)} fps` : "—"],
    ["Bitrate", formatBitrate(i.bitrate)],
    ["Duration", formatTime(i.durationSec)],
    ["Size", formatBytes(i.sizeBytes)],
    ["Audio", i.audioTracks.map((t) => t.codec).join(", ") || "none"],
    ["Playback", engine],
  ];
  return (
    <div className="info-panel" onDoubleClick={(e) => e.stopPropagation()}>
      <div className="info-head">
        <strong>File info</strong>
        <button type="button" className="link-btn" onClick={onClose}>Close</button>
      </div>
      <dl>
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
      <button type="button" className="primary-btn" onClick={() => window.babu.reveal(i.path)}>
        Show in Finder
      </button>
    </div>
  );
}

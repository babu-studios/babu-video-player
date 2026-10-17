import { useEffect, useState } from "react";
import type { RecentFile } from "../types/player";
import { HelpNote } from "./HelpNote";
import { Logo } from "./Logo";
import { RecentFiles } from "./RecentFiles";

interface Props {
  onOpen: () => void;
  onRecent: (path: string) => void;
}

export function EmptyState({ onOpen, onRecent }: Props) {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  useEffect(() => { void window.babu.getRecents().then(setRecents); }, []);

  return (
    <div className="empty">
      <div className="empty-glow" />
      <main className="empty-main">
        <Logo />
        <h1>Babu Video Player</h1>
        <p className="tagline">Plays almost any video. Simple, fast, no fuss.</p>
        <div className="dropzone" onClick={onOpen} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}>
          <span className="dropzone-title">Drop a video here</span>
          <span className="dropzone-sub">or</span>
          <button type="button" className="primary-btn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Open file <kbd>⌘O</kbd>
          </button>
          <span className="formats">MP4 · MKV · MOV · WebM · AVI · HEVC · AV1 and more</span>
        </div>
        <RecentFiles items={recents} onOpen={onRecent} />
      </main>
      <HelpNote />
    </div>
  );
}

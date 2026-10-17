import { useEffect } from "react";
import type { PlayerState } from "./usePlayerState";

interface Deps {
  enabled: boolean;
  player: PlayerState;
  toggleFullscreen: () => void;
  openFile: () => void;
}

export function usePlayerShortcuts({ enabled, player: p, toggleFullscreen, openFile }: Deps) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      const handlers: Record<string, () => void> = {
        " ": p.toggle,
        ArrowLeft: () => p.seek(p.time - 5),
        ArrowRight: () => p.seek(p.time + 5),
        ArrowUp: () => p.setVolume(p.volume + 0.05),
        ArrowDown: () => p.setVolume(p.volume - 0.05),
        f: toggleFullscreen,
        m: p.toggleMute,
        "[": () => p.stepRate(-1),
        "]": () => p.stepRate(1),
      };
      const h = handlers[e.key] ?? handlers[e.key.toLowerCase()];
      if (!h) return;
      e.preventDefault();
      h();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, p, toggleFullscreen, openFile]);
}

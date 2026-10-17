import { useEffect, useState } from "react";
import type { PlaybackPlan } from "../types/player";
import { friendlyError } from "../utils/format";

/** Loads the selected embedded subtitle track as a WebVTT blob URL. */
export function useSubtitles(plan: PlaybackPlan | null, onError: (m: string) => void) {
  const [selected, setSelected] = useState(-1);
  const [url, setUrl] = useState<string | null>(null);
  const file = plan?.info.path;
  const offset = plan?.startOffset ?? 0;

  useEffect(() => { setSelected(-1); }, [file]);

  useEffect(() => {
    if (selected < 0) { setUrl(null); return; }
    let cancelled = false;
    let made: string | null = null;
    window.babu.getSubtitle(selected, offset)
      .then((vtt) => {
        if (cancelled) return;
        made = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
        setUrl(made);
      })
      .catch((e) => { if (!cancelled) { setSelected(-1); onError(friendlyError(e)); } });
    return () => { cancelled = true; if (made) URL.revokeObjectURL(made); };
  }, [selected, offset, file, onError]);

  return { selected, setSelected, url };
}

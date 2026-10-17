import { useCallback, useEffect, useState } from "react";
import type { PlaybackPlan, ToastKind } from "../types/player";
import { friendlyError } from "../utils/format";
import { loadPosition } from "../utils/storage";

type Notify = (kind: ToastKind, msg: string) => void;

export function usePlaybackSource(notify: Notify) {
  const [plan, setPlan] = useState<PlaybackPlan | null>(null);
  const [initialTime, setInitialTime] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Applies saved position and the canPlayType check before showing a plan. */
  const accept = useCallback(async (incoming: PlaybackPlan) => {
    let next = incoming;
    const saved = loadPosition(next.info);
    const canNative = next.mode === "native" && document.createElement("video").canPlayType(next.mime) !== "";
    if (next.mode === "native" && !canNative) next = await window.babu.forceTranscode(saved);
    else if (next.mode === "transcode" && saved > 0) next = await window.babu.restart(saved, 0);
    setInitialTime(next.mode === "native" ? saved : 0);
    setPlan(next);
  }, []);

  const run = useCallback(async (job: () => Promise<PlaybackPlan | null>, resume = true) => {
    setLoading(true);
    try {
      const p = await job();
      if (!p) return;
      if (resume) await accept(p);
      else { setInitialTime(0); setPlan(p); }
    } catch (e) {
      notify("error", friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [accept, notify]);

  useEffect(() => {
    const offPlan = window.babu.onPlan((p) => void run(async () => p));
    const offErr = window.babu.onError((m) => notify("error", friendlyError(m)));
    window.babu.ready();
    return () => { offPlan(); offErr(); };
  }, [run, notify]);

  const openDialog = useCallback(() => run(() => window.babu.openDialog()), [run]);
  const openRecent = useCallback((p: string) => run(() => window.babu.openRecent(p)), [run]);
  const openDropped = useCallback((f: File) => run(() => window.babu.openDropped(window.babu.pathForFile(f))), [run]);
  const restartAt = useCallback(
    (t: number, audio: number) => run(() => window.babu.restart(t, audio), false), [run],
  );

  /** Called when <video> errors: native files fall back to ffmpeg once. */
  const onVideoError = useCallback((absTime: number) => {
    if (plan?.mode === "native") {
      void run(() => window.babu.forceTranscode(absTime), false);
    } else {
      notify("error", "This file couldn't be played. It may be corrupt or unsupported.");
    }
  }, [plan, run, notify]);

  const close = useCallback(() => { window.babu.closeMedia(); setPlan(null); }, []);

  return { plan, initialTime, loading, openDialog, openRecent, openDropped, restartAt, onVideoError, close };
}

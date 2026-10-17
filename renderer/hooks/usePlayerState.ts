import { useCallback, useEffect, useState, type RefObject } from "react";
import type { PlaybackPlan } from "../types/player";
import { clamp } from "../utils/format";

export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export function usePlayerState(
  ref: RefObject<HTMLVideoElement | null>,
  plan: PlaybackPlan | null,
  restart: (absTime: number) => void,
) {
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState(1);
  const offset = plan?.startOffset ?? 0;
  const duration = plan?.info.durationSec || mediaDuration;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.volume = volume; v.muted = muted; v.playbackRate = rate;
  }, [ref, plan, volume, muted, rate]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !plan) return;
    const sync = () => {
      setTime(offset + v.currentTime);
      setPaused(v.paused);
      setMediaDuration(Number.isFinite(v.duration) ? v.duration : 0);
      const b = v.buffered;
      setBufferedEnd(b.length ? offset + b.end(b.length - 1) : 0);
    };
    const events = ["timeupdate", "progress", "play", "pause", "durationchange", "seeked", "loadedmetadata"];
    events.forEach((e) => v.addEventListener(e, sync));
    sync();
    return () => {
      events.forEach((e) => v.removeEventListener(e, sync));
    };
  }, [ref, plan, offset]);

  /** Seeks inside the produced range, otherwise restarts ffmpeg at the target. */
  const seek = useCallback((target: number) => {
    const v = ref.current;
    if (!v || !plan) return;
    const t = clamp(target, 0, duration || target);
    if (plan.mode === "native") { v.currentTime = t; return; }
    const rel = t - offset;
    const b = v.buffered;
    const inRange = rel >= 0 && b.length > 0 && rel <= b.end(b.length - 1) - 0.25;
    if (inRange) v.currentTime = rel;
    else restart(t);
  }, [ref, plan, duration, offset, restart]);

  const toggle = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined); else v.pause();
  }, [ref]);

  const setVolume = useCallback((n: number) => {
    setVolumeState(clamp(n, 0, 1));
    if (n > 0) setMuted(false);
  }, []);
  const setRate = useCallback((n: number) => setRateState(clamp(n, 0.25, 3)), []);
  const stepRate = useCallback((dir: 1 | -1) => {
    const i = SPEEDS.findIndex((s) => s >= rate - 1e-6);
    setRateState(SPEEDS[clamp((i < 0 ? SPEEDS.length - 1 : i) + dir, 0, SPEEDS.length - 1)]);
  }, [rate]);

  return {
    paused, time, bufferedEnd, duration, volume, muted, rate,
    seek, toggle, setVolume, setRate, stepRate,
    toggleMute: useCallback(() => setMuted((m) => !m), []),
  };
}

export type PlayerState = ReturnType<typeof usePlayerState>;

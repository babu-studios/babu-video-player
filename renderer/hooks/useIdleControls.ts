import { useEffect, useState } from "react";

/** Controls stay visible while paused; hide after `ms` of no mouse activity while playing. */
export function useIdleControls(playing: boolean, ms = 2500): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wake = () => {
      setVisible(true);
      clearTimeout(timer);
      if (playing) timer = setTimeout(() => setVisible(false), ms);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [playing, ms]);

  return visible || !playing;
}

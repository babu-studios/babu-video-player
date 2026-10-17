import { Slider } from "./common/Slider";
import { formatTime } from "../utils/format";

interface Props {
  time: number;
  duration: number;
  buffered: number;
  onSeek: (t: number) => void;
}

export function SeekBar({ time, duration, buffered, onSeek }: Props) {
  return (
    <Slider
      className="seekbar" label="Seek" value={time} max={duration} buffered={buffered}
      onChange={onSeek} tooltip={formatTime}
    />
  );
}

import { Dropdown } from "./common/Dropdown";
import type { PlaybackPlan } from "../types/player";
import { trackLabel } from "../utils/format";

interface Props {
  plan: PlaybackPlan;
  subtitle: number;
  onAudio: (ordinal: number) => void;
  onSubtitle: (ordinal: number) => void;
}

export function TrackMenus({ plan, subtitle, onAudio, onSubtitle }: Props) {
  const { audioTracks, subtitleTracks } = plan.info;
  return (
    <>
      {audioTracks.length > 1 && (
        <Dropdown
          icon="audio" label="Audio track" selected={plan.audioOrdinal} onSelect={onAudio}
          options={audioTracks.map((t) => ({ value: t.ordinal, label: trackLabel(t, t.ordinal + 1) }))}
        />
      )}
      {subtitleTracks.length > 0 && (
        <Dropdown
          icon="subtitles" label="Subtitles" selected={subtitle} onSelect={onSubtitle}
          options={[
            { value: -1, label: "Off" },
            ...subtitleTracks.map((t) => ({ value: t.ordinal, label: trackLabel(t, t.ordinal + 1) })),
          ]}
        />
      )}
    </>
  );
}

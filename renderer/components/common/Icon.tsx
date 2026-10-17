const PATHS = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  back10: "M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z",
  fwd10: "M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z",
  volume: "M3 9v6h4l5 5V4L7 9zM16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z",
  mute: "M3 9v6h4l5 5V4L7 9zM16 9l5 6m0-6l-5 6",
  fullscreen: "M5 5h5V3H3v7h2zM14 3v2h5v5h2V3zM5 14H3v7h7v-2H5zM19 19h-5v2h7v-7h-2z",
  exitFullscreen: "M8 3H6v3H3v2h5zM16 3h-2v5h5V6h-3zM3 16h3v3h2v-5H3zM14 14v5h2v-3h3v-2z",
  pip: "M19 7H5v10h14zM3 5h18v14H3zM11 11h7v5h-7z",
  info: "M11 7h2v2h-2zM11 11h2v6h-2zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
  audio: "M12 3v10.5a4 4 0 1 0 2 3.5V7h4V3z",
  subtitles: "M4 5h16v14H4zM7 10h4v2H7zM13 10h4v2h-4zM7 14h6v2H7z",
  folder: "M3 5h7l2 2h9v12H3z",
  speed: "M12 4a9 9 0 0 0-9 9h2a7 7 0 0 1 14 0h2a9 9 0 0 0-9-9zM12 12l4-4",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={PATHS[name]} fillRule="evenodd" />
    </svg>
  );
}

# Babu Video Player

A fast, simple, open-source video player for macOS (Apple Silicon and Intel).
Plays MP4, MKV, MOV, AVI, WebM, HEVC, AV1 and more, with multiple audio tracks, embedded subtitles and
resume playback. No camera or microphone access, no telemetry.

**[Download](https://babu-studios.github.io/babu-video-player/)** or get the `.dmg` from the
[Releases page](https://github.com/babu-studios/babu-video-player/releases):
`-arm64.dmg` for Apple Silicon (M1 and later), `-x64.dmg` for Intel.

## Install

1. Open the `.dmg` and drag the app to Applications.
2. The app isn't notarized yet, so macOS blocks the first launch:
   - **macOS 15 and later:** click **Done**, then System Settings → Privacy & Security → **Open Anyway**.
   - **macOS 14 and earlier:** right-click the app → **Open** → **Open**.
   - **Terminal:** `xattr -cr "/Applications/Babu Video Player.app"`
3. Optional, to make it your default player: **Finder → Get Info → Open with → Change All**.

Open a file from the terminal with `open -a "Babu Video Player" /path/to/video.mp4`.

## Run from source

```bash
npm install
npm install-scripts approve esbuild ffmpeg-static   # npm 12+ blocks install scripts by default
npm rebuild esbuild ffmpeg-static
npm run dev
```

Other commands: `npm test` (unit tests) and `npm run build` (typecheck and build).
Architecture, adding formats, releases and licensing are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Contributing

This is an open-source project and contributions are welcome.

1. Found a bug or have an idea? [Open an issue](https://github.com/babu-studios/babu-video-player/issues).
2. Want to fix or build something? Fork the repo, create a branch, and open a pull request against `main`.
   `main` is protected, so all changes go through a pull request with passing CI.
3. Before you open the PR, run `npm run typecheck`, `npm test` and `npm run build`.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the code guidelines and the full PR checklist.

## License

MIT, see [LICENSE](LICENSE). Release builds bundle an LGPL ffmpeg, see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

# Babu Video Player

A small, fast, general-purpose video player for macOS built with Electron, React, TypeScript and Vite.
Plays MP4, M4V, MOV, MKV, WebM, AVI, WMV, FLV, TS, MPEG, 3GP, HEVC and AV1 through Chromium's `<video>`
when it can, and a bundled ffmpeg when it can't.

## Setup

```bash
npm install
npm install-scripts approve esbuild ffmpeg-static   # npm 12+ blocks install scripts by default
npm rebuild esbuild ffmpeg-static
npm run dev        # Vite + esbuild watch + Electron
npm run build      # typecheck, build renderer and main process
npm test           # unit tests (format detection, ffmpeg args)
npm run dist       # .dmg for arm64 and x64 (needs LGPL ffmpeg in vendor/, see Licensing)
```

Open a file from the command line or another app:

```bash
open -a "Babu Video Player" /path/to/video.mp4
```

To make it the default player: **Finder → Get Info → Open with → Change All**. The app never changes
defaults itself.

## Architecture

```
electron/            main process (bundled to dist-electron by esbuild)
  main.ts            lifecycle, single instance, open-file / CLI queue, shutdown cleanup
  window.ts          BrowserWindow (contextIsolation, sandbox, no nodeIntegration, all permissions denied)
  preload.ts         typed contextBridge API (shared/types.ts → BabuBridge)
  ipc.ts, menu.ts    IPC handlers, Cmd+O menu
  allowlist.ts       only user-opened paths may be served
  protocol.ts        babu-video-player:// with HTTP Range support, plus live tailing of ffmpeg output
  playback.ts        decides native vs ffmpeg, owns the current file and stream session
  media/
    formats.ts       extension and codec detection
    probe.ts         ffprobe wrapper, keyframe lookup
    ffmpegArgs.ts    pure builders for remux / transcode / subtitle commands
    session.ts       ffmpeg run writing fragmented MP4 to the temp cache
    processes.ts     tracked child processes, killed on switch/quit/SIGINT/SIGTERM
renderer/            React UI: components/ (common/ has IconButton, Slider, Dropdown, Toast),
                     hooks/, utils/, types/, styles/ (one CSS file per feature)
shared/types.ts      types shared by main, preload and renderer
```

### Playback paths

1. **Native.** For MP4/M4V/MOV/WebM with H.264/VP8/VP9/AV1 and AAC/MP3/Opus/Vorbis, 8-bit, one audio track,
   `formats.nativeMime` builds a MIME string. The renderer checks `canPlayType` and listens for the `error`
   event; either failing falls back to ffmpeg. Files are served with Range support.
2. **ffmpeg.** Everything else. 8-bit H.264 is **remuxed** (`-c copy`); other codecs are transcoded to H.264
   with `h264_videotoolbox`, falling back to `libx264`. Audio is copied if AAC stereo, otherwise encoded to AAC.
   Output is fragmented MP4 in `$TMPDIR/babu-video-player-cache/`, streamed to the renderer while it is
   written. Seeking outside the buffered range restarts ffmpeg with `-ss`; for remux the start snaps to the
   preceding keyframe, and the UI uses that real time. Switching audio track restarts the session with another
   `-map`. Embedded text subtitles are extracted to WebVTT on demand.

Temp files are deleted when the file changes, on quit and at startup. ffmpeg processes are killed on file
switch, quit, SIGINT and SIGTERM.

### Security

Only paths the user opened (CLI, `open-file`, Open dialog, drag-and-drop, or a recent file) are added to the
allow-list; the protocol handler rejects everything else. The app requests no camera or microphone access, and
the packaging step removes Electron's default camera/microphone usage strings from `Info.plist`.

## Adding a format

1. Add the extension to `SUPPORTED_EXTENSIONS` in `electron/media/formats.ts`.
2. Add a `fileAssociations` entry in `electron-builder.yml`.
3. If Chromium can play it natively, add its container to `NATIVE_CONTAINERS` and its codecs to
   `VIDEO_CODEC_TAGS` / `AUDIO_CODEC_TAGS`. Otherwise nothing else is needed: ffmpeg handles it.
4. Add a test in `tests/formats.test.ts`.

## Download and install

Get the latest `.dmg` from the [Releases page](https://github.com/babu-studios/babu-video-player/releases):
`-arm64.dmg` for Apple Silicon (M1 and later), `-x64.dmg` for Intel Macs. Open it and drag the app to
Applications. Checksums are in `SHA256SUMS.txt` (`shasum -a 256 -c SHA256SUMS.txt`).

The app is not notarized, so macOS may say it "can't be opened because Apple cannot check it for malicious
software". Right-click the app → **Open** → **Open**, or run:

```bash
xattr -cr "/Applications/Babu Video Player.app"
```

## Publishing a release

Releases are built by GitHub Actions ([release.yml](.github/workflows/release.yml)), on a macOS arm64 runner
and a macOS Intel runner.

```bash
# bump "version" in package.json first, commit, then:
git tag v0.1.0
git push origin v0.1.0
```

The workflow tests, builds an LGPL ffmpeg for each architecture (about 10 minutes, cached afterwards), builds
both `.dmg` files and attaches them, plus `SHA256SUMS.txt`, to a new GitHub Release. Pull requests and pushes to
`main` run typecheck and tests ([ci.yml](.github/workflows/ci.yml)).

To build locally: `scripts/build-ffmpeg.sh` (host architecture only, about 10 minutes), then `npm run dist`
once both architectures exist in `vendor/ffmpeg/`, or `npx electron-builder --mac --arm64` for one.
To sign and notarize later, add an Apple Developer ID certificate as repository secrets and pass
`CSC_LINK`, `CSC_KEY_PASSWORD` and the `APPLE_*` notarization variables to the build step.

## Licensing

ffmpeg is LGPL or GPL depending on how it is built. The `ffmpeg-static` / `ffprobe-static` packages are
**GPL builds** and are dev dependencies only, used by `npm run dev`. They are never shipped.

Release builds use [scripts/build-ffmpeg.sh](scripts/build-ffmpeg.sh), which compiles the unmodified official
ffmpeg source with `--disable-gpl --disable-nonfree` and VideoToolbox, giving an **LGPL** build. The binaries
run as separate programs in `Contents/Resources/bin`, so users can replace them, and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) ships inside the app with the license and source location.
Keep the ffmpeg version in the script and the release in sync, as the LGPL source offer relies on it.

Because there is no `libx264` in an LGPL build, H.264 encoding uses `h264_videotoolbox` (Apple hardware or
system encoder, on both Intel and Apple Silicon). Software AV1 decoding (`libdav1d`) is not included, so AV1
inside MKV/TS may not play; AV1 in MP4/WebM plays natively through Chromium.

`npm run dist:dev-gpl` packages the host architecture with the GPL binaries for **local testing only**; never
distribute that output. Environment overrides: `BABU_FFMPEG_PATH` and `BABU_FFPROBE_PATH`.

## Website

The download page lives in `site/` and is deployed to GitHub Pages by `.github/workflows/pages.yml`. It looks up the latest release, so it needs no change per release.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, guidelines and the pull request checklist.

## Notes

- The icon is a generated placeholder (`scripts/make-icon.py`); replace `build/icon.icns`.
- Builds are unsigned unless a Developer ID certificate is available.
- Image-based subtitles (PGS, VobSub) are not supported; text subtitles are.

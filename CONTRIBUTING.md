# Contributing to Babu Video Player

Thanks for helping! Bug reports, fixes, new format support and documentation improvements are all welcome.

## Ways to contribute

- **Report a bug.** Open an issue with your macOS version, chip (Apple Silicon or Intel), app version, the file
  format and codecs (`ffprobe file.mkv` output helps), and what you expected. Please don't attach copyrighted
  videos; a short sample made with ffmpeg is ideal.
- **Suggest a feature.** Open an issue first so we can agree on scope before you write code. The goal is a
  small, fast, simple player, so features that add a lot of UI or weight may be declined.
- **Send a pull request.** See below.

## Development setup

Requires macOS, Node.js 22 or newer and npm.

```bash
git clone https://github.com/babu-studios/babu-video-player.git
cd babu-video-player
npm install
npm install-scripts approve esbuild ffmpeg-static   # npm 12+ blocks install scripts by default
npm rebuild esbuild ffmpeg-static
node node_modules/electron/install.js               # downloads the Electron binary if it is missing
npm run dev
```

`npm run dev` uses the GPL `ffmpeg-static` binaries from `node_modules`. They are for local development only
and are never shipped.

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server, esbuild watch and Electron |
| `npm run typecheck` | Type checks the renderer and the main process |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Typecheck, then build renderer and main process |
| `npm run dist:dev-gpl` | Local packaged app using GPL ffmpeg, for testing only. Never share the output |

A quick way to get test videos is ffmpeg itself:

```bash
node_modules/ffmpeg-static/ffmpeg -f lavfi -i testsrc=size=640x360:rate=30:duration=20 \
  -f lavfi -i sine=duration=20 -c:v libx264 -c:a aac -pix_fmt yuv420p sample.mp4
```

Read [Architecture](docs/DEVELOPMENT.md#architecture) in the development notes before changing playback. In short: the renderer
plays natively with `<video>` when it can, and otherwise the main process runs ffmpeg and streams fragmented MP4
over the `babu-video-player://` protocol.

## Code guidelines

- TypeScript with `strict` on. Avoid `any`.
- Keep files small, under about 150 lines. Split a file rather than let it grow.
- One CSS file per feature in `renderer/styles/`. Reusable UI belongs in `renderer/components/common/`.
- Comments only where the code needs clarification.
- Keep the Electron security settings: `contextIsolation` on, `nodeIntegration` off, sandbox on. Any new
  renderer capability goes through the typed preload bridge (`shared/types.ts` and `electron/preload.ts`).
- The protocol handler must only serve paths in the allow-list (`electron/allowlist.ts`). Don't widen it.
- Don't add camera, microphone or any other permission request.
- Don't add telemetry or network calls. The app works fully offline.
- Any ffmpeg process must go through `electron/media/processes.ts` so it is killed on quit and file switch.
- Add or update tests for changes to format detection (`tests/formats.test.ts`) and ffmpeg arguments
  (`tests/ffmpegArgs.test.ts`). New formats: see [Adding a format](docs/DEVELOPMENT.md#adding-a-format).

## Pull request checklist

1. Fork the repo and create a branch from `main` (for example `fix/mkv-seek` or `feat/external-subtitles`).
2. Keep the change focused: one fix or feature per PR, with no unrelated reformatting.
3. Make sure these pass locally:
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```
4. If you changed playback, test by hand with at least one native file (H.264 MP4), one remuxed file (H.264 in
   MKV) and one transcoded file (for example HEVC or AVI), including seeking.
5. If the UI changed, include a screenshot or short recording in the PR.
6. Open the PR against `main` and describe what changed and why. Link the issue it fixes, if any.

CI (typecheck and tests) runs on every PR and must be green before merging. Commit messages should be short and
in the imperative mood, such as "Fix seek after audio track switch".

## Licensing

By contributing you agree that your contribution is released under the project's [MIT license](LICENSE). Don't add code or
assets you don't have the right to share.

ffmpeg licensing needs care. Release builds ship an **LGPL** ffmpeg built by `scripts/build-ffmpeg.sh`. Do not
add flags such as `--enable-gpl`, `--enable-nonfree` or `--enable-libx264` to that script, and don't bundle other
GPL or non-free binaries. See [Licensing](docs/DEVELOPMENT.md#licensing) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Releases (maintainers)

Bump `version` in `package.json`, commit, then push a tag such as `v0.1.1`. GitHub Actions builds the arm64 and
x64 `.dmg` files and publishes the release. Details are in [Publishing a release](docs/DEVELOPMENT.md#publishing-a-release).

## Security

Please don't open a public issue for a security vulnerability. Use GitHub's
[private vulnerability reporting](https://github.com/babu-studios/babu-video-player/security/advisories/new)
on this repository instead.

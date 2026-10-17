# Third-party notices

## FFmpeg

Babu Video Player bundles the `ffmpeg` and `ffprobe` command-line programs from the FFmpeg project
(https://ffmpeg.org), licensed under the **GNU Lesser General Public License v2.1 or later**.

The bundled binaries are built without `--enable-gpl` and `--enable-nonfree` by
[scripts/build-ffmpeg.sh](scripts/build-ffmpeg.sh) from the unmodified official source release
(version set in that script, downloaded from https://ffmpeg.org/releases/). They run as separate programs,
located in the app bundle at `Contents/Resources/bin`, so you can replace them with your own build, or set
the `BABU_FFMPEG_PATH` and `BABU_FFPROBE_PATH` environment variables.

FFmpeg is a trademark of Fabrice Bellard. The LGPL v2.1 text: https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html

## Electron, Chromium, React

Electron and Chromium are distributed under the MIT and BSD-style licenses; their notices ship in the app
bundle (`LICENSE`, `LICENSES.chromium.html`). React is MIT licensed.

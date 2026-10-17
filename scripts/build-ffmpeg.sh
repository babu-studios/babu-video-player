#!/usr/bin/env bash
# Builds a minimal LGPL ffmpeg + ffprobe for the host architecture into vendor/ffmpeg/<arch>/.
# No GPL or nonfree components are enabled (no libx264); H.264 encoding uses Apple VideoToolbox.
set -euo pipefail

FFMPEG_VERSION="${FFMPEG_VERSION:-7.1.1}"
case "$(uname -m)" in
  arm64) ARCH=arm64 ;;
  x86_64) ARCH=x64 ;;
  *) echo "Unsupported architecture $(uname -m)" >&2; exit 1 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${TMPDIR:-/tmp}/babu-ffmpeg-build"
OUT="$ROOT/vendor/ffmpeg/$ARCH"
mkdir -p "$WORK" "$OUT"
cd "$WORK"

if [ ! -d "ffmpeg-$FFMPEG_VERSION" ]; then
  curl -fsSL "https://ffmpeg.org/releases/ffmpeg-$FFMPEG_VERSION.tar.xz" -o src.tar.xz
  tar xf src.tar.xz
fi
cd "ffmpeg-$FFMPEG_VERSION"

./configure \
  --disable-gpl --disable-nonfree --disable-version3 \
  --disable-doc --disable-ffplay --disable-debug \
  --disable-autodetect --enable-videotoolbox --enable-audiotoolbox \
  --disable-x86asm \
  --enable-static --disable-shared

make -j"$(sysctl -n hw.ncpu)"
cp ffmpeg ffprobe "$OUT/"
strip "$OUT/ffmpeg" "$OUT/ffprobe"

echo "License:"; "$OUT/ffmpeg" -hide_banner -L | head -3
"$OUT/ffmpeg" -hide_banner -encoders | grep -E "h264_videotoolbox" || { echo "VideoToolbox encoder missing" >&2; exit 1; }
if "$OUT/ffmpeg" -hide_banner -version | grep -qE -- "--enable-(gpl|nonfree)"; then
  echo "Build is not LGPL" >&2; exit 1
fi
echo "Built $OUT"

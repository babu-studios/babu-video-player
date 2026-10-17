// Verifies vendor/ffmpeg/<arch>/{ffmpeg,ffprobe} exist before packaging.
// --host-only checks just this machine's arch. --dev-gpl copies the GPL ffmpeg-static/ffprobe-static builds for the host arch (local testing only).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const hostArch = process.arch;

if (process.argv.includes("--dev-gpl")) {
  const dir = join("vendor", "ffmpeg", hostArch);
  mkdirSync(dir, { recursive: true });
  copyFileSync(require("ffmpeg-static"), join(dir, "ffmpeg"));
  copyFileSync(require("ffprobe-static").path, join(dir, "ffprobe"));
  console.warn(`WARNING: copied GPL binaries for ${hostArch}. Do not distribute this build.`);
}

const archs = process.argv.includes("--host-only") ? [hostArch] : ["arm64", "x64"];
const missing = archs.flatMap((a) =>
  ["ffmpeg", "ffprobe"].map((b) => join("vendor", "ffmpeg", a, b)).filter((p) => !existsSync(p)));
if (missing.length) {
  console.error(`Missing LGPL binaries:\n  ${missing.join("\n  ")}\nSee README "Licensing".`);
  process.exit(1);
}

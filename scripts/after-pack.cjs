// Electron ships camera/microphone usage strings; this app never uses them, so remove them.
const { execFileSync } = require("node:child_process");
const { join } = require("node:path");

const KEYS = ["NSCameraUsageDescription", "NSMicrophoneUsageDescription",
  "NSBluetoothAlwaysUsageDescription", "NSBluetoothPeripheralUsageDescription"];

exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== "darwin") return;
  const plist = join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.app`, "Contents", "Info.plist");
  for (const key of KEYS) {
    try { execFileSync("/usr/libexec/PlistBuddy", ["-c", `Delete :${key}`, plist], { stdio: "ignore" }); } catch { /* absent */ }
  }
  // Editing Info.plist invalidates Electron's signature; re-sign ad hoc so Apple Silicon will launch it.
  // A real Developer ID identity, when configured, replaces this signature afterwards.
  const app = join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.app`);
  execFileSync("codesign", ["--force", "--deep", "-s", "-", app], { stdio: "ignore" });
};

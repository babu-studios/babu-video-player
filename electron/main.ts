import { app, ipcMain } from "electron";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { registerIpc } from "./ipc";
import { buildMenu } from "./menu";
import { isSupportedExtension } from "./media/formats";
import { cleanCacheRoot } from "./media/session";
import { killAll } from "./media/processes";
import type { PlaybackPlan } from "../shared/types";
import { closeMedia, openMedia } from "./playback";
import { setPreventSleep } from "./powerSave";
import { registerProtocol, registerScheme } from "./protocol";
import { createWindow, getWindow } from "./window";

registerScheme();

let rendererReady = false;
// Only the most recent request matters; probing starts right away so it overlaps window load.
let queued: { plan: Promise<PlaybackPlan> } | null = null;

function deliver(plan: Promise<PlaybackPlan>): void {
  const win = getWindow();
  plan.then(
    (p) => win?.webContents.send("media:plan", p),
    (e: Error) => win?.webContents.send("media:error", e.message),
  );
}

function openInWindow(path: string): void {
  const win = getWindow();
  const plan = openMedia(path);
  if (!win || !rendererReady) {
    plan.catch(() => undefined);
    queued = { plan };
    return;
  }
  if (win.isMinimized()) win.restore();
  win.focus();
  deliver(plan);
}

function cliFiles(argv: string[]): string[] {
  const args = argv.slice(app.isPackaged ? 1 : 2);
  return args.filter((a) => !a.startsWith("-") && existsSync(a) && isSupportedExtension(a))
    .map((a) => resolve(a));
}

function shutdown(): void {
  closeMedia();
  setPreventSleep(false);
  killAll();
  cleanCacheRoot();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // open-file can fire before ready; it is queued until the renderer asks.
  app.on("open-file", (e, path) => { e.preventDefault(); openInWindow(path); });
  app.on("second-instance", (_e, argv) => cliFiles(argv).forEach(openInWindow));
  app.on("before-quit", shutdown);
  app.on("window-all-closed", () => app.quit());
  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, () => { shutdown(); app.exit(0); });
  }

  cleanCacheRoot();
  const launchFile = cliFiles(process.argv).pop();
  if (launchFile) openInWindow(launchFile);

  void app.whenReady().then(() => {
    registerProtocol();
    registerIpc();
    createWindow(() => { rendererReady = false; });
    ipcMain.on("app:ready", () => {
      rendererReady = true;
      if (queued) deliver(queued.plan);
      queued = null;
    });
    buildMenu();
  });
}

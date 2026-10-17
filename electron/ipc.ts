import { dialog, ipcMain, shell } from "electron";
import { existsSync } from "node:fs";
import type { PlaybackPlan } from "../shared/types";
import { isAllowed } from "./allowlist";
import { SUPPORTED_EXTENSIONS } from "./media/formats";
import { closeMedia, openMedia, restartStream, subtitleFor } from "./playback";
import { setPreventSleep } from "./powerSave";
import { getRecents, isRecent } from "./recents";
import { getWindow } from "./window";

function validPath(p: unknown): p is string {
  return typeof p === "string" && p.length > 0 && existsSync(p);
}

export async function showOpenDialog(): Promise<PlaybackPlan | null> {
  const win = getWindow();
  const opts = {
    properties: ["openFile" as const],
    filters: [
      { name: "Videos", extensions: SUPPORTED_EXTENSIONS },
      { name: "All files", extensions: ["*"] },
    ],
  };
  const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
  return res.canceled || !res.filePaths[0] ? null : openMedia(res.filePaths[0]);
}

export function registerIpc(): void {
  ipcMain.handle("media:open-dialog", () => showOpenDialog());
  ipcMain.handle("media:open-dropped", (_e, p: unknown) => {
    if (!validPath(p)) throw new Error("File not found");
    return openMedia(p);
  });
  ipcMain.handle("media:open-recent", (_e, p: unknown) => {
    if (!validPath(p) || !isRecent(p)) throw new Error("File not found");
    return openMedia(p);
  });
  ipcMain.handle("media:restart", (_e, start: number, audio: number) =>
    restartStream(Math.max(0, Number(start) || 0), Math.max(0, Number(audio) || 0)));
  ipcMain.handle("media:subtitle", (_e, ordinal: number, offset: number) =>
    subtitleFor(Number(ordinal) || 0, Math.max(0, Number(offset) || 0)));
  ipcMain.handle("media:recents", () => getRecents());
  ipcMain.on("media:reveal", (_e, p: unknown) => {
    if (typeof p === "string" && isAllowed(p)) shell.showItemInFolder(p);
  });
  ipcMain.on("media:playing", (_e, on: unknown) => setPreventSleep(on === true));
  ipcMain.on("media:close", () => { closeMedia(); setPreventSleep(false); });
}

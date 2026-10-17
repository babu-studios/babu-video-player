import { BrowserWindow, session } from "electron";
import { join } from "node:path";

let win: BrowserWindow | null = null;

export function getWindow(): BrowserWindow | null {
  return win && !win.isDestroyed() ? win : null;
}

export function createWindow(onClosed: () => void): BrowserWindow {
  // Only fullscreen is granted; camera, mic and everything else stay denied.
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === "fullscreen"));
  session.defaultSession.setPermissionCheckHandler((_wc, perm) => perm === "fullscreen");

  win = new BrowserWindow({
    width: 1100, height: 680, minWidth: 480, minHeight: 320,
    title: "Babu Video Player", backgroundColor: "#0e0f12",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.on("closed", () => { win = null; onClosed(); });

  const dev = process.env.VITE_DEV_SERVER_URL;
  if (dev) void win.loadURL(dev);
  else void win.loadFile(join(__dirname, "../dist-renderer/index.html"));
  return win;
}

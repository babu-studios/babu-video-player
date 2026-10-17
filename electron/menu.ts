import { Menu, type MenuItemConstructorOptions } from "electron";
import { showOpenDialog } from "./ipc";
import { getWindow } from "./window";

async function openFromMenu(): Promise<void> {
  const win = getWindow();
  try {
    const plan = await showOpenDialog();
    if (plan) win?.webContents.send("media:plan", plan);
  } catch (e) {
    win?.webContents.send("media:error", (e as Error).message);
  }
}

export function buildMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    { role: "appMenu" },
    {
      label: "File",
      submenu: [
        { label: "Open…", accelerator: "CmdOrCtrl+O", click: () => void openFromMenu() },
        { type: "separator" },
        { role: "close" },
      ],
    },
    { role: "editMenu" },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

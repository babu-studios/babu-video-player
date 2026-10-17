import { powerSaveBlocker } from "electron";

let id: number | null = null;

export function setPreventSleep(on: boolean): void {
  if (on && id === null) id = powerSaveBlocker.start("prevent-display-sleep");
  if (!on && id !== null) {
    powerSaveBlocker.stop(id);
    id = null;
  }
}

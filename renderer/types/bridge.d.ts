import type { BabuBridge } from "../../shared/types";

declare global {
  interface Window {
    babu: BabuBridge;
  }
}

export {};

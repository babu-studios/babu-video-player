import { spawn, type ChildProcess } from "node:child_process";

const tracked = new Set<ChildProcess>();

export function spawnTracked(cmd: string, args: string[]): ChildProcess {
  const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
  tracked.add(child);
  child.on("exit", () => tracked.delete(child));
  return child;
}

export function killProcess(child: ChildProcess | null): void {
  if (child && child.exitCode === null) child.kill("SIGKILL");
}

export function killAll(): void {
  tracked.forEach((c) => killProcess(c));
  tracked.clear();
}

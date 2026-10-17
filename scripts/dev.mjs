import { spawn } from "node:child_process";

const run = (cmd, args, env = {}) =>
  spawn(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });

const children = [];
const stop = () => children.forEach((c) => c.kill("SIGTERM"));
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

children.push(run("npx", ["vite"]));
children.push(run("node", ["scripts/build-electron.mjs", "--watch"]));
await new Promise((r) => run("npx", ["wait-on", "http://localhost:5173", "dist-electron/main.js"]).on("exit", r));
const app = run("npx", ["electron", "."], { VITE_DEV_SERVER_URL: "http://localhost:5173" });
children.push(app);
app.on("exit", () => { stop(); process.exit(0); });

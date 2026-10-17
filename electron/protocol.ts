import { protocol } from "electron";
import { createReadStream, openSync, readSync, closeSync, statSync } from "node:fs";
import { Readable } from "node:stream";
import { isAllowed } from "./allowlist";
import { mimeForPath } from "./media/formats";
import { getStream } from "./playback";
import type { StreamSession } from "./media/session";

export const SCHEME = "babu-video-player";

export function registerScheme(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: SCHEME, privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true } },
  ]);
}

const deny = () => new Response("Forbidden", { status: 403 });

function parseRange(header: string | null, size: number): [number, number] | null {
  const m = header && /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!m || (!m[1] && !m[2])) return null;
  let start = m[1] ? Number(m[1]) : size - Number(m[2]);
  const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  start = Math.max(0, start);
  return start > end ? null : [start, end];
}

function serveFile(path: string, rangeHeader: string | null): Response {
  if (!isAllowed(path)) return deny();
  let size: number;
  try { size = statSync(path).size; } catch { return new Response("Not found", { status: 404 }); }
  const headers: Record<string, string> = {
    "Content-Type": mimeForPath(path), "Accept-Ranges": "bytes",
  };
  const range = parseRange(rangeHeader, size);
  if (rangeHeader && !range) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const [start, end] = range ?? [0, size - 1];
  headers["Content-Length"] = String(end - start + 1);
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  const body = Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream;
  return new Response(body, { status: range ? 206 : 200, headers });
}

/** Tails the growing fragmented MP4 until ffmpeg finishes. */
function serveStream(s: StreamSession, signal: AbortSignal): Response {
  const fd = openSync(s.file, "r");
  let pos = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const buf = Buffer.alloc(256 * 1024);
      for (;;) {
        if (signal.aborted) { closeSync(fd); return controller.close(); }
        const n = readSync(fd, buf, 0, buf.length, pos);
        if (n > 0) {
          pos += n;
          return controller.enqueue(new Uint8Array(buf.subarray(0, n)));
        }
        if (s.done) { closeSync(fd); return controller.close(); }
        await new Promise((r) => setTimeout(r, 40));
      }
    },
    cancel() { try { closeSync(fd); } catch { /* already closed */ } },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "video/mp4" } });
}

export function registerProtocol(): void {
  protocol.handle(SCHEME, (req) => {
    const url = new URL(req.url);
    if (url.hostname === "file") {
      return serveFile(decodeURIComponent(url.pathname.slice(1)), req.headers.get("range"));
    }
    if (url.hostname === "stream") {
      const s = getStream(url.pathname.slice(1));
      return s ? serveStream(s, req.signal) : deny();
    }
    return deny();
  });
}

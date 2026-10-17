import type { RecentFile } from "../types/player";

function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

const extOf = (n: string) => (n.split(".").pop() ?? "").slice(0, 4).toUpperCase();

export function RecentFiles({ items, onOpen }: { items: RecentFile[]; onOpen: (path: string) => void }) {
  if (items.length === 0) return null;
  return (
    <section className="recents">
      <h2>Recent</h2>
      <ul>
        {items.slice(0, 5).map((r) => (
          <li key={r.path}>
            <button type="button" className="recent-item" title={r.path} onClick={() => onOpen(r.path)}>
              <span className="recent-badge">{extOf(r.name)}</span>
              <span className="recent-name">{r.name}</span>
              <span className="recent-time">{ago(r.openedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

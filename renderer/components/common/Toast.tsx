import { useCallback, useRef, useState } from "react";
import type { ToastItem, ToastKind } from "../../types/player";

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setItems((l) => [...l.slice(-3), { id, kind, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  return { items, push };
}

export function ToastHost({ items }: { items: ToastItem[] }) {
  return (
    <div className="toast-host" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>{t.message}</div>
      ))}
    </div>
  );
}

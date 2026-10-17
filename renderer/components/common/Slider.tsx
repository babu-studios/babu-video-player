import { useRef, useState, type PointerEvent } from "react";
import { clamp } from "../../utils/format";

interface Props {
  value: number;
  max: number;
  buffered?: number;
  label: string;
  className?: string;
  onChange: (v: number) => void;
  tooltip?: (v: number) => string;
}

export function Slider({ value, max, buffered = 0, label, className = "", onChange, tooltip }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; v: number } | null>(null);
  const dragging = useRef(false);

  const valueAt = (e: PointerEvent): { x: number; v: number } => {
    const r = ref.current!.getBoundingClientRect();
    const x = clamp(e.clientX - r.left, 0, r.width);
    return { x, v: r.width ? (x / r.width) * max : 0 };
  };
  const pct = (v: number) => (max > 0 ? clamp((v / max) * 100, 0, 100) : 0);

  return (
    <div
      ref={ref} className={`slider ${className}`} role="slider" aria-label={label}
      aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); onChange(valueAt(e).v); }}
      onPointerMove={(e) => { const p = valueAt(e); setHover(p); if (dragging.current) onChange(p.v); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerLeave={() => setHover(null)}
    >
      <div className="slider-track">
        <div className="slider-buffered" style={{ width: `${pct(buffered)}%` }} />
        <div className="slider-fill" style={{ width: `${pct(value)}%` }} />
      </div>
      <div className="slider-thumb" style={{ left: `${pct(value)}%` }} />
      {tooltip && hover && (
        <div className="slider-tooltip" style={{ left: hover.x }}>{tooltip(hover.v)}</div>
      )}
    </div>
  );
}

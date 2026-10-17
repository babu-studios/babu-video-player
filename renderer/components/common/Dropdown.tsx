import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./Icon";

export interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  icon: IconName;
  label: string;
  options: Option<T>[];
  selected: T;
  buttonText?: string;
  onSelect: (v: T) => void;
}

export function Dropdown<T extends string | number>(p: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="icon-btn dropdown-btn" title={p.label} aria-label={p.label}
        aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={p.icon} />
        {p.buttonText && <span className="dropdown-text">{p.buttonText}</span>}
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox">
          {p.options.map((o) => (
            <li key={String(o.value)} role="option" aria-selected={o.value === p.selected}
              className={o.value === p.selected ? "is-selected" : ""}
              onClick={() => { p.onSelect(o.value); setOpen(false); }}>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

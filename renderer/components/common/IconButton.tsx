import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  active?: boolean;
}

export function IconButton({ icon, label, active, className = "", ...rest }: Props) {
  return (
    <button
      type="button" title={label} aria-label={label}
      className={`icon-btn ${active ? "is-active" : ""} ${className}`} {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" className="logo">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8aa4ff" />
          <stop offset="1" stopColor="#5a4bff" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" rx="18" fill="url(#logo-g)" />
      <path d="M28 21v30l25-15z" fill="#fff" />
    </svg>
  );
}

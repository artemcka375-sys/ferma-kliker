export function CowSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 220" className={className} aria-hidden="true">
      <ellipse className="cow-body" cx="78" cy="188" rx="16" ry="10" />
      <ellipse className="cow-body" cx="162" cy="188" rx="16" ry="10" />
      <rect className="cow-body" x="68" y="168" width="18" height="28" rx="8" />
      <rect className="cow-body" x="154" y="168" width="18" height="28" rx="8" />
      <ellipse className="cow-body" cx="120" cy="148" rx="82" ry="50" />
      <ellipse className="cow-spot" cx="78" cy="138" rx="20" ry="14" />
      <ellipse className="cow-spot" cx="162" cy="160" rx="16" ry="12" />
      <ellipse className="cow-udder" cx="120" cy="186" rx="28" ry="16" />
      <circle className="cow-udder" cx="108" cy="194" r="4" />
      <circle className="cow-udder" cx="120" cy="196" r="4" />
      <circle className="cow-udder" cx="132" cy="194" r="4" />
      <ellipse className="cow-ear" cx="70" cy="78" rx="16" ry="11" />
      <ellipse className="cow-ear" cx="170" cy="78" rx="16" ry="11" />
      <path className="cow-horn" d="M82 58q-18-30 6-38" />
      <path className="cow-horn" d="M158 58q18-30-6-38" />
      <circle className="cow-body" cx="120" cy="78" r="50" />
      <ellipse className="cow-eye" cx="102" cy="74" rx="8" ry="10" />
      <ellipse className="cow-eye" cx="138" cy="74" rx="8" ry="10" />
      <circle className="cow-glint" cx="104" cy="71" r="2.4" />
      <circle className="cow-glint" cx="140" cy="71" r="2.4" />
      <ellipse className="cow-snout" cx="120" cy="98" rx="24" ry="16" />
      <ellipse className="cow-eye" cx="112" cy="98" rx="3" ry="4.5" />
      <ellipse className="cow-eye" cx="128" cy="98" rx="3" ry="4.5" />
      <path className="cow-smile" d="M108 112q12 10 24 0" />
      <path className="cow-bell" d="M114 122h12l-2 16h-8z" />
    </svg>
  );
}

export function PigSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <ellipse className="pig-body" cx="60" cy="62" rx="40" ry="28" />
      <ellipse className="pig-ear" cx="34" cy="36" rx="12" ry="14" />
      <ellipse className="pig-ear" cx="86" cy="36" rx="12" ry="14" />
      <circle className="pig-body" cx="60" cy="42" r="26" />
      <ellipse className="pig-snout" cx="60" cy="50" rx="14" ry="10" />
      <ellipse className="cow-eye" cx="55" cy="50" rx="2" ry="3" />
      <ellipse className="cow-eye" cx="65" cy="50" rx="2" ry="3" />
      <ellipse className="cow-eye" cx="50" cy="36" rx="3" ry="4" />
      <ellipse className="cow-eye" cx="70" cy="36" rx="3" ry="4" />
      <circle className="cow-glint" cx="51" cy="35" r="1.2" />
      <circle className="cow-glint" cx="71" cy="35" r="1.2" />
      <path className="cow-bell" d="M46 16h28l-4 10H50z" />
    </svg>
  );
}

export function DroneSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true">
      <g className="prop" style={{ transformOrigin: "28px 28px" }}>
        <ellipse cx="28" cy="28" rx="18" ry="6" />
      </g>
      <g className="prop" style={{ transformOrigin: "132px 28px" }}>
        <ellipse cx="132" cy="28" rx="18" ry="6" />
      </g>
      <rect className="drone-arm" x="36" y="40" width="88" height="8" rx="4" />
      <rect className="drone-body" x="52" y="34" width="56" height="32" rx="12" />
      <circle className="drone-eye" cx="70" cy="50" r="4" />
      <circle className="drone-eye" cx="90" cy="50" r="4" />
      <rect className="cow-bell" x="70" y="68" width="20" height="22" rx="4" />
      <path className="cow-smile" d="M74 66v8M86 66v8" />
    </svg>
  );
}

export function BaconSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" className={className} aria-hidden="true">
      <path className="bacon-fat" d="M8 18c18-16 28 16 46 0s28 16 50 0v28c-22 16-32-16-50 0S26 62 8 46z" />
      <path className="bacon-meat" d="M14 24c16-12 24 12 40 0s26 12 46 0" />
      <path className="bacon-meat" d="M14 40c16-12 24 12 40 0s26 12 46 0" />
      <ellipse className="cow-eye" cx="78" cy="30" rx="3" ry="4" />
      <ellipse className="cow-eye" cx="92" cy="30" rx="3" ry="4" />
      <path className="cow-smile" d="M80 40q6 6 14 0" />
    </svg>
  );
}

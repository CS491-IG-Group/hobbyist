export default function OrbitLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Planet */}
      <circle cx="32" cy="32" r="10" fill="url(#planetGrad)" />
      {/* Orbit ring 1 */}
      <ellipse cx="32" cy="32" rx="28" ry="10" stroke="url(#ringGrad1)" strokeWidth="2" fill="none"
        transform="rotate(-20 32 32)" />
      {/* Orbit ring 2 */}
      <ellipse cx="32" cy="32" rx="24" ry="8" stroke="url(#ringGrad2)" strokeWidth="1.5" fill="none"
        transform="rotate(40 32 32)" />
      <defs>
        <radialGradient id="planetGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <linearGradient id="ringGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="ringGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
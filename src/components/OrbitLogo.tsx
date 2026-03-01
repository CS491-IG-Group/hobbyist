"use client";

interface Props {
  size?: number;
}

export default function OrbitLogo({ size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="36"
        cy="36"
        r="32"
        stroke="currentColor"
        strokeWidth="2"
        style={{ color: "var(--text-muted)" }}
      />
      <circle
        cx="36"
        cy="36"
        r="20"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: "var(--text-muted)" }}
      />
      <circle
        cx="36"
        cy="20"
        r="6"
        fill="#a78bfa"
      />
      <circle
        cx="36"
        cy="52"
        r="4"
        fill="#a78bfa"
        opacity={0.7}
      />
      <circle
        cx="20"
        cy="36"
        r="4"
        fill="#a78bfa"
        opacity={0.8}
      />
      <circle
        cx="52"
        cy="36"
        r="4"
        fill="#a78bfa"
        opacity={0.8}
      />
    </svg>
  );
}

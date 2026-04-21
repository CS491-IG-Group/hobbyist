"use client";
import { useEffect, useRef } from "react";

export default function LoginOrbitBackground({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.2,
      a: Math.random() * 0.7 + 0.2,
      s: Math.random() * 0.1 + 0.02,
    }));

    const orbitalPlanes = [
      { radius: 3.2, flatten: 0.62, tilt: -0.44, alpha: 0.34, width: 2.6 },
      { radius: 3.8, flatten: 0.64, tilt: -0.41, alpha: 0.32, width: 2.4 },
      { radius: 4.5, flatten: 0.66, tilt: -0.38, alpha: 0.28, width: 2.2 },
      { radius: 5.3, flatten: 0.68, tilt: -0.35, alpha: 0.24, width: 2.05 },
      { radius: 6.2, flatten: 0.7, tilt: -0.32, alpha: 0.2, width: 1.9 },
      { radius: 7.2, flatten: 0.72, tilt: -0.29, alpha: 0.18, width: 1.75 },
    ];

    const roamers = [
      { plane: 0, size: 3.1, speed: 1.35, phase: 0.2, alpha: 0.74 },
      { plane: 1, size: 2.8, speed: 1.1, phase: 1.8, alpha: 0.7 },
      { plane: 2, size: 2.4, speed: 0.86, phase: 3.9, alpha: 0.64 },
      { plane: 3, size: 2.1, speed: 0.72, phase: 5.1, alpha: 0.6 },
      { plane: 4, size: 1.9, speed: 0.6, phase: 2.7, alpha: 0.56 },
      { plane: 5, size: 1.7, speed: 0.52, phase: 4.4, alpha: 0.52 },
    ];

    const drawGlow = (x: number, y: number, r: number, color: string, alpha = 1) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color.replace("ALPHA", `${0.95 * alpha}`));
      g.addColorStop(0.35, color.replace("ALPHA", `${0.45 * alpha}`));
      g.addColorStop(1, color.replace("ALPHA", "0"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (time: number) => {
      const isLight = theme === "light";
      const t = time * 0.001;
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      if (isLight) {
        bg.addColorStop(0, "#f8f7ff");
        bg.addColorStop(0.42, "#eef2ff");
        bg.addColorStop(1, "#e7ecff");
      } else {
        bg.addColorStop(0, "#090a14");
        bg.addColorStop(0.45, "#0e1022");
        bg.addColorStop(1, "#070811");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const x = (s.x * w + t * 10 * s.s) % (w + 20);
        const y = (s.y * h + Math.sin(t * s.s * 8 + s.x * 20) * 3 + h) % h;
        const alphaBase = isLight ? 0.22 : s.a;
        const pulse = Math.sin(t * 2 + s.x * 13) * (isLight ? 0.04 : 0.08);
        ctx.globalAlpha = alphaBase + pulse;
        ctx.fillStyle = isLight ? "#475569" : "white";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const anchorX = w * 0.58 + Math.sin(t * 0.13) * Math.min(14, w * 0.01);
      const anchorY = h * 0.38 + Math.cos(t * 0.12) * Math.min(10, h * 0.01);
      const planetR = Math.min(138, Math.max(88, w * 0.085));

      drawGlow(anchorX, anchorY, planetR * 2.8, "rgba(129,140,248,ALPHA)", isLight ? 0.24 : 0.34);
      drawGlow(anchorX, anchorY, planetR * 1.35, "rgba(251,191,36,ALPHA)", isLight ? 0.24 : 0.3);

      // Brighter nucleus/star for solar-system style
      ctx.save();
      ctx.translate(anchorX, anchorY);
      const planetGrad = ctx.createRadialGradient(
        -planetR * 0.25,
        -planetR * 0.25,
        planetR * 0.1,
        0,
        0,
        planetR
      );
      if (isLight) {
        planetGrad.addColorStop(0, "rgba(255, 254, 240, 0.98)");
        planetGrad.addColorStop(0.34, "rgba(253, 230, 180, 0.9)");
        planetGrad.addColorStop(0.72, "rgba(147, 197, 253, 0.78)");
        planetGrad.addColorStop(1, "rgba(129, 140, 248, 0.72)");
      } else {
        planetGrad.addColorStop(0, "rgba(255, 253, 230, 1)");
        planetGrad.addColorStop(0.3, "rgba(252, 226, 160, 0.96)");
        planetGrad.addColorStop(0.7, "rgba(167, 139, 250, 0.9)");
        planetGrad.addColorStop(1, "rgba(99, 102, 241, 0.88)");
      }
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(0, 0, planetR, 0, Math.PI * 2);
      ctx.fill();

      // crisp nucleus edge so it stays visible under wide rings
      ctx.strokeStyle = isLight ? "rgba(251, 191, 36, 0.68)" : "rgba(255, 242, 205, 0.78)";
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = isLight ? "rgba(251, 191, 36, 0.34)" : "rgba(251, 191, 36, 0.45)";
      ctx.beginPath();
      ctx.arc(0, 0, planetR * 0.985, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Intersecting orbital planes (atom-like, less dramatic)
      orbitalPlanes.forEach((plane) => {
        ctx.save();
        ctx.translate(anchorX, anchorY);
        ctx.rotate(plane.tilt);
        ctx.strokeStyle = isLight
          ? `rgba(59,130,246,${plane.alpha * 0.72})`
          : `rgba(147,197,253,${plane.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = isLight ? "rgba(59,130,246,0.16)" : "rgba(96,165,250,0.24)";
        ctx.lineWidth = plane.width;
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          planetR * plane.radius,
          planetR * plane.flatten,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      });

      // roaming particles locked to planes
      roamers.forEach((sat, idx) => {
        const a = t * sat.speed + sat.phase;
        const plane = orbitalPlanes[sat.plane % orbitalPlanes.length];
        const rx = planetR * plane.radius;
        const ry = planetR * plane.flatten;
        const localX = Math.cos(a) * rx;
        const localY = Math.sin(a) * ry;
        const cosT = Math.cos(plane.tilt);
        const sinT = Math.sin(plane.tilt);
        const x = anchorX + localX * cosT - localY * sinT;
        const y = anchorY + localX * sinT + localY * cosT;
        const depth = (Math.sin(a) + 1) / 2;
        const glowAlpha = sat.alpha * (0.22 + depth * 0.3);
        drawGlow(
          x,
          y,
          sat.size * 4.2,
          isLight ? "rgba(59,130,246,ALPHA)" : "rgba(147,197,253,ALPHA)",
          isLight ? glowAlpha * 0.75 : glowAlpha
        );
        ctx.fillStyle = isLight
          ? (idx % 2 === 0 ? "rgba(51,65,85,0.88)" : "rgba(37,99,235,0.84)")
          : (idx % 2 === 0 ? "rgba(226,232,240,0.96)" : "rgba(191,219,254,0.9)");
        ctx.beginPath();
        ctx.arc(x, y, sat.size + depth * 0.85, 0, Math.PI * 2);
        ctx.fill();
      });

      const haze = ctx.createRadialGradient(anchorX - 160, anchorY + 20, 0, anchorX - 160, anchorY + 20, 420);
      if (isLight) {
        haze.addColorStop(0, "rgba(99,102,241,0.11)");
        haze.addColorStop(1, "rgba(99,102,241,0)");
      } else {
        haze.addColorStop(0, "rgba(118,92,255,0.13)");
        haze.addColorStop(1, "rgba(118,92,255,0)");
      }
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      animationFrame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [theme]);

  const overlayStyle =
    theme === "light"
      ? {
          background:
            "radial-gradient(circle at 20% 18%, rgba(129, 140, 248, 0.14), transparent 34%), radial-gradient(circle at 78% 24%, rgba(56, 189, 248, 0.12), transparent 26%), linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(238,242,255,0.54))",
        }
      : {
          background:
            "radial-gradient(circle at 25% 20%, rgba(129,140,248,0.16), transparent 28%), radial-gradient(circle at 80% 25%, rgba(192,132,252,0.14), transparent 20%), linear-gradient(to bottom, rgba(3,7,18,0.2), rgba(3,7,18,0.45))",
        };

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0" style={overlayStyle} />
    </div>
  );
}

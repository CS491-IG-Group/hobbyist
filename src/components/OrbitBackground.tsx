"use client";

const STAR_COUNT = 36;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  left: ((i * 53 + 17) % 100) + "%",
  top: ((i * 29 + 11) % 100) + "%",
  size: 1 + (i % 3),
  delay: (i * 0.37) % 6,
  duration: 4 + (i % 5),
}));

const ORBIT_COUNT = 3;
const orbits = Array.from({ length: ORBIT_COUNT }, (_, i) => ({
  id: i,
  size: 220 + i * 95,
  duration: 26 + i * 10,
  reverse: i % 2 === 1,
}));

export default function OrbitBackground() {
  return (
    <div className="orbitr-overlay" aria-hidden>
      <div className="orbitr-nebula orbitr-nebula-a" />
      <div className="orbitr-nebula orbitr-nebula-b" />

      <div className="orbitr-system">
        {orbits.map((orbit) => (
          <div
            key={orbit.id}
            className="orbitr-ring"
            style={{
              width: orbit.size,
              height: orbit.size,
              animationDuration: `${orbit.duration}s`,
              animationDirection: orbit.reverse ? "reverse" : "normal",
            }}
          >
            <span className="orbitr-node" />
          </div>
        ))}
      </div>

      {stars.map((star) => (
        <span
          key={star.id}
          className="orbitr-star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

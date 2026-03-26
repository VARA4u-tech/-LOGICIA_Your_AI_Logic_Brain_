import { useMemo } from "react";

const mathSymbols = ["∑", "π", "∫", "√", "∞", "Δ", "θ", "λ"];

const AnimatedBackground = () => {
  const streaks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 50}%`,
        width: `${150 + Math.random() * 300}px`,
        delay: `${Math.random() * 8}s`,
        duration: `${4 + Math.random() * 6}s`,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 3,
        delay: `${Math.random() * 10}s`,
        duration: `${6 + Math.random() * 8}s`,
        opacity: 0.2 + Math.random() * 0.5,
      })),
    [],
  );

  const symbols = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        symbol: mathSymbols[i % mathSymbols.length],
        left: `${5 + Math.random() * 90}%`,
        size: 16 + Math.random() * 24,
        delay: `${Math.random() * 12}s`,
        duration: `${10 + Math.random() * 10}s`,
        opacity: 0.08 + Math.random() * 0.12,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 will-change-auto">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary" />

      {/* Radial glow center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(120 100% 54% / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Diagonal streaks — GPU accelerated */}
      {streaks.map((s) => (
        <div
          key={s.id}
          className="absolute h-[1px] animate-streak will-change-transform"
          style={{
            top: s.top,
            left: s.left,
            width: s.width,
            background: `linear-gradient(90deg, transparent, hsl(120 100% 54% / ${s.opacity}), transparent)`,
            animationDelay: s.delay,
            animationDuration: s.duration,
            transform: "rotate(-35deg) translateZ(0)",
            transformOrigin: "left center",
          }}
        />
      ))}

      {/* Floating particles — GPU accelerated */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-up will-change-transform"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: `hsl(120 100% 54% / ${p.opacity})`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Floating math symbols — GPU accelerated */}
      {symbols.map((s) => (
        <div
          key={`sym-${s.id}`}
          className="absolute animate-float-up font-display select-none will-change-transform"
          style={{
            left: s.left,
            fontSize: s.size,
            color: `hsl(120 100% 54% / ${s.opacity})`,
            animationDelay: s.delay,
            animationDuration: s.duration,
            transform: `rotate(${s.rotate}deg) translateZ(0)`,
          }}
        >
          {s.symbol}
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;

import { useEffect, useRef, useState } from "react";
import {
  Triangle,
  TrendingUp,
  BarChart3,
  Hexagon,
  Zap,
  Brain,
  Clock,
  Globe,
  Sparkles,
  Search,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "EXAM EXPERT",
    description:
      "Intelligent help for UPSC, SSC, Banking, and Railways — providing clear steps for every answer.",
    highlights: ["General Studies", "Reasoning", "Learning Tricks"],
  },
  {
    icon: Triangle,
    title: "ACCURATE MATH",
    description:
      "Smart math engine that solves complex equations with perfect logic and no errors.",
    highlights: ["Algebra", "Calculus", "100% Correct"],
  },
  {
    icon: Globe,
    title: "LOCAL LANGUAGES",
    description:
      "Full support in English and Telugu, making it easy for students across India to learn.",
    highlights: ["Regional Support", "Telugu Help", "Easy to Read"],
  },
  {
    icon: MessageSquare,
    title: "LIVE CHAT",
    description:
      "Ask questions in a real-time chat with instant graphs and clear math symbols.",
    highlights: ["Math Symbols", "Live Graphs", "24/7 Access"],
  },
];

const stats = [
  { icon: Zap, value: 1, suffix: "s", label: "Response Time", prefix: "<" },
  { icon: Brain, value: 99.9, suffix: "%", label: "Accuracy Rate" },
  { icon: Clock, value: 24, suffix: "/7", label: "Availability" },
  { icon: Globe, value: 50, suffix: "+", label: "Math Topics" },
];

/* ─── Animated Counter Hook ─────────────────────────────────────────────── */
const useCountUp = (target: number, duration = 1600, active = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(target % 1 === 0 ? 0 : 1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
};

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon,
  value,
  suffix,
  label,
  prefix,
  active,
  delay,
}: {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
  active: boolean;
  delay: number;
}) => {
  const animatedValue = useCountUp(value, 1600, active);
  const displayValue =
    value % 1 === 0 ? Math.round(animatedValue) : animatedValue.toFixed(1);

  return (
    <div
      className={`text-center transition-all duration-500 ${active ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <Icon size={18} className="text-primary mx-auto mb-2" />
      <div className="font-display text-2xl sm:text-3xl font-bold text-primary neon-text tabular-nums">
        {prefix}
        {displayValue}
        {suffix}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wider font-body mt-1">
        {label}
      </div>
    </div>
  );
};

/* ─── FeaturesSection ────────────────────────────────────────────────────── */
const FeaturesSection = () => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Cards visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Stats counter visibility (separate so counters start when stats bar is visible)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.5 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      className="relative z-10 py-20 sm:py-24 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          FEATURES
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-12 sm:mb-16 max-w-xl mx-auto">
          Powered by advanced AI to solve any mathematical challenge
        </p>

        {/* Feature Cards — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className={`group glass-strong rounded-xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box cursor-default ${
                visible ? "animate-fade-in-up opacity-100" : "opacity-0"
              }`}
              style={{
                animationDelay: `${i * 0.12}s`,
                animationFillMode: "forwards",
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-primary/30 flex items-center justify-center mb-4 sm:mb-5 group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
                <feat.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-display text-xs sm:text-sm tracking-[0.2em] text-primary mb-2 sm:mb-3">
                {feat.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body mb-3 sm:mb-4">
                {feat.description}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {feat.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-[9px] sm:text-[10px] font-display tracking-wider px-2 py-1 rounded border border-primary/20 text-primary/70"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Animated Stats Bar */}
        <div
          ref={statsRef}
          className="glass rounded-xl p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6"
        >
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              prefix={stat.prefix}
              active={statsVisible}
              delay={i * 0.12}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

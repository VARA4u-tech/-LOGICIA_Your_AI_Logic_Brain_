import { useEffect, useRef, useState } from "react";
import { Triangle, TrendingUp, BarChart3, Hexagon, Zap, Brain, Clock, Globe } from "lucide-react";

const features = [
  {
    icon: Triangle,
    title: "ALGEBRA",
    description: "Solve equations, simplify expressions, factor polynomials, and work with inequalities instantly.",
    highlights: ["Linear & Quadratic", "Polynomials", "Systems of Equations"],
  },
  {
    icon: TrendingUp,
    title: "CALCULUS",
    description: "Derivatives, integrals, limits, and series — all computed with full step-by-step breakdowns.",
    highlights: ["Derivatives", "Integrals", "Limits & Series"],
  },
  {
    icon: BarChart3,
    title: "STATISTICS",
    description: "Probability, distributions, hypothesis testing, and regression analysis made simple.",
    highlights: ["Probability", "Distributions", "Regression"],
  },
  {
    icon: Hexagon,
    title: "GEOMETRY",
    description: "Areas, volumes, transformations, and proofs — visualized and solved with precision.",
    highlights: ["2D & 3D Shapes", "Transformations", "Trigonometry"],
  },
];

const stats = [
  { icon: Zap, value: "< 1s", label: "Response Time" },
  { icon: Brain, value: "99.9%", label: "Accuracy Rate" },
  { icon: Clock, value: "24/7", label: "Availability" },
  { icon: Globe, value: "50+", label: "Math Topics" },
];

const FeaturesSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl text-center font-bold text-primary neon-text mb-4">
          CAPABILITIES
        </h2>
        <p className="text-center text-muted-foreground text-sm font-body tracking-wider mb-16 max-w-xl mx-auto">
          Powered by advanced AI to solve any mathematical challenge
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className={`group glass-strong rounded-lg p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box cursor-default ${
                visible ? "animate-fade-in-up opacity-100" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "forwards" }}
            >
              <div className="w-12 h-12 rounded-lg border border-primary/30 flex items-center justify-center mb-5 group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
                <feat.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-display text-sm tracking-[0.2em] text-primary mb-3">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body mb-4">{feat.description}</p>
              <div className="flex flex-wrap gap-2">
                {feat.highlights.map((h) => (
                  <span key={h} className="text-[10px] font-display tracking-wider px-2 py-1 rounded border border-primary/20 text-primary/70">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="glass rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon size={18} className="text-primary mx-auto mb-2" />
              <div className="font-display text-2xl md:text-3xl font-bold text-primary neon-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground tracking-wider font-body mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

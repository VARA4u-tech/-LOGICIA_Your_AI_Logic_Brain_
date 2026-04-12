import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Cpu,
  FlaskConical,
  BookOpen,
  BarChart2,
  Send,
} from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "ASK",
    description:
      "Type any exam question — from UPSC history to SSC math — using simple English or math symbols.",
    example: '"Solve x^2 - 5x + 6"',
  },
  {
    icon: Cpu,
    step: "02",
    title: "THINK",
    description:
      "The engine identifies your question's topic instantly, whether it's Math, Reason, or GK.",
    example: "→ Math | Algebra",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "SOLVE",
    description:
      "Our math engine calculates the answer with perfect logic, ensuring every calculation is 100% correct.",
    example: "Accurate & Logical",
  },
  {
    icon: BookOpen,
    step: "04",
    title: "EXPLAIN",
    description:
      "The result is turned into a simple step-by-step lesson, including shortcuts and easy tricks to remember.",
    example: '"Shortcut: Quadratic Trick"',
  },
  {
    icon: BarChart2,
    step: "05",
    title: "VISUALIZE",
    description:
      "If helpful, interactive charts or maps are created to help you visualize what you're learning.",
    example: "Interactive Graph",
  },
  {
    icon: Send,
    step: "06",
    title: "DELIVER",
    description:
      "The complete logical answer — in English or Telugu — is shown instantly on your screen.",
    example: "< 1s Response Speed",
  },
];

const HowItWorksSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative z-10 py-20 sm:py-24 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          HOW IT WORKS
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-12 sm:mb-16 max-w-xl mx-auto">
          A smart six-stage process — from your question to the final solution
        </p>

        {/* Timeline grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`group relative glass-strong rounded-xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box ${
                visible ? "animate-fade-in-up opacity-100" : "opacity-0"
              }`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              {/* Step number watermark */}
              <span className="absolute top-4 right-4 sm:top-5 sm:right-5 font-display text-4xl sm:text-5xl font-black text-primary/5 select-none leading-none group-hover:text-primary/10 transition-colors duration-300">
                {s.step}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-primary/30 flex items-center justify-center mb-4 group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
                <s.icon size={18} className="text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xs sm:text-sm tracking-[0.25em] text-primary mb-2">
                {s.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body mb-3">
                {s.description}
              </p>

              {/* Example chip */}
              <div className="inline-flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md bg-primary/8 border border-primary/20 text-primary/70">
                <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                {s.example}
              </div>

              {/* Connector arrow — shown between cards on larger screens (decorative) */}
              {i < steps.length - 1 && (i + 1) % 3 !== 0 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 items-center justify-center">
                  <div className="w-4 h-px bg-primary/30" />
                  <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

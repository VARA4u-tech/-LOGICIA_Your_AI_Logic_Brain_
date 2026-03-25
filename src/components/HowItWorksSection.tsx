import { useEffect, useRef, useState } from "react";
import { MessageSquare, Cpu, FlaskConical, BookOpen, BarChart2, Send } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "INPUT",
    description: "You type any math problem — from basic arithmetic to advanced calculus — in natural language or math notation.",
    example: "\"Solve x² − 5x + 6 = 0\"",
  },
  {
    icon: Cpu,
    step: "02",
    title: "CLASSIFY",
    description: "The AI engine instantly identifies the problem type — Algebra, Calculus, Statistics, or Geometry — and routes it correctly.",
    example: "→ Quadratic Algebra",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "SOLVE",
    description: "A symbolic math engine computes the accurate result. No AI guessing — pure mathematical precision guaranteed.",
    example: "x₁ = 3, x₂ = 2",
  },
  {
    icon: BookOpen,
    step: "04",
    title: "EXPLAIN",
    description: "AI converts the raw solution into step-by-step human-readable explanations, just like a real math tutor would.",
    example: "\"Apply the quadratic formula...\"",
  },
  {
    icon: BarChart2,
    step: "05",
    title: "VISUALIZE",
    description: "Where applicable, graphs and visual aids are generated to help you truly understand the problem intuitively.",
    example: "Graph of f(x) = x² − 5x + 6",
  },
  {
    icon: Send,
    step: "06",
    title: "DELIVER",
    description: "The complete solution — steps, explanation, and visuals — is delivered back instantly in the chat interface.",
    example: "< 1 second response",
  },
];

const HowItWorksSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="relative z-10 py-20 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          HOW IT WORKS
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-12 sm:mb-16 max-w-xl mx-auto">
          A six-stage intelligent pipeline — from your input to the perfect answer
        </p>

        {/* Timeline grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className={`group relative glass-strong rounded-xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box ${
                visible ? "animate-fade-in-up opacity-100" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
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

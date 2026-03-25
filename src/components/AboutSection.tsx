import { useEffect, useRef, useState } from "react";
import { Cpu, Sparkles, BookOpen, Github, Twitter, Linkedin } from "lucide-react";

const highlights = [
  {
    icon: Cpu,
    title: "AI-POWERED ENGINE",
    desc: "Advanced neural architecture processes complex equations in milliseconds with near-perfect accuracy.",
  },
  {
    icon: Sparkles,
    title: "INSTANT SOLUTIONS",
    desc: "Get complete step-by-step breakdowns the moment you submit your problem. No waiting.",
  },
  {
    icon: BookOpen,
    title: "LEARN AS YOU SOLVE",
    desc: "Every solution includes explanations so you understand the method, not just the answer.",
  },
];

const tags = ["Neural Networks", "Real-Time Processing", "LaTeX Rendering", "Step-by-Step", "Open Source", "Mobile-First"];

const AboutSection = () => {
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
    <section id="about" ref={ref} className="relative z-10 py-20 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          ABOUT
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-12 sm:mb-16 max-w-xl mx-auto">
          The future of mathematical problem solving
        </p>

        <div className={`grid md:grid-cols-2 gap-8 sm:gap-10 items-start ${visible ? "animate-fade-in-up" : "opacity-0"}`}>

          {/* Left — text + tags */}
          <div className="space-y-5 sm:space-y-6">
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-body">
              LOGICIA is a next-generation intelligent math solver built to handle everything from basic arithmetic to advanced calculus. Powered by a hybrid AI + symbolic engine, it delivers instant, accurate solutions with detailed step-by-step explanations.
            </p>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-body">
              Whether you're a student preparing for exams, a professional engineer, or simply curious — our AI breaks down complex problems into clear, understandable steps. No more guessing. No more struggling. Just answers.
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] sm:text-[10px] font-display tracking-[0.15em] sm:tracking-[0.2em] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-primary/25 text-primary/80 hover:border-primary/50 hover:text-primary transition-colors duration-200"
                >
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded border border-primary/25 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:neon-box transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right — feature highlights */}
          <div className="space-y-4 sm:space-y-5">
            {highlights.map((item, i) => (
              <div
                key={item.title}
                className={`glass-strong rounded-xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start transition-all duration-500 hover:border-primary/40 hover:neon-box ${
                  visible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(i + 1) * 0.15}s`, animationFillMode: "forwards" }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-[10px] sm:text-xs tracking-[0.2em] text-primary mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;

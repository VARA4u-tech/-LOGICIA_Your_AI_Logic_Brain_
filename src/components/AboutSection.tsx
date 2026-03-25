import { useEffect, useRef, useState } from "react";
import { Cpu, Sparkles, BookOpen } from "lucide-react";

const AboutSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl text-center font-bold text-primary neon-text mb-4">
          ABOUT
        </h2>
        <p className="text-center text-muted-foreground text-sm font-body tracking-wider mb-16 max-w-xl mx-auto">
          The future of mathematical problem solving
        </p>

        <div className={`grid md:grid-cols-2 gap-10 items-center ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          {/* Left — text */}
          <div className="space-y-6">
            <p className="text-sm text-foreground/80 leading-relaxed font-body">
              AI Math Assistant is a next-generation intelligent solver built to handle everything from basic arithmetic to advanced calculus. Powered by cutting-edge neural networks, it delivers instant, accurate solutions with detailed step-by-step explanations.
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed font-body">
              Whether you're a student preparing for exams, a professional engineer, or simply curious — our AI breaks down complex problems into clear, understandable steps. No more guessing. No more struggling. Just answers.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {["Neural Networks", "Real-Time Processing", "LaTeX Rendering", "Step-by-Step"].map((tag) => (
                <span key={tag} className="text-[10px] font-display tracking-[0.2em] px-3 py-1.5 rounded-sm border border-primary/25 text-primary/80">
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Right — feature highlights */}
          <div className="space-y-5">
            {[
              { icon: Cpu, title: "AI-POWERED ENGINE", desc: "Advanced neural architecture processes complex equations in milliseconds with near-perfect accuracy." },
              { icon: Sparkles, title: "INSTANT SOLUTIONS", desc: "Get complete step-by-step breakdowns the moment you submit your problem. No waiting." },
              { icon: BookOpen, title: "LEARN AS YOU SOLVE", desc: "Every solution includes explanations so you understand the method, not just the answer." },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`glass-strong rounded-lg p-5 flex gap-4 items-start transition-all duration-500 hover:border-primary/40 hover:neon-box ${
                  visible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${(i + 1) * 0.2}s`, animationFillMode: "forwards" }}
              >
                <div className="w-10 h-10 rounded border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-xs tracking-[0.2em] text-primary mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">{item.desc}</p>
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

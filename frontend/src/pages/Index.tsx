import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, MessageSquare, FileText } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0,
      );
      setShowBackToTop(scrollTop > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="relative min-h-screen">
      {/* Scroll bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
        <div
          className="h-full bg-primary neon-box transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AnimatedBackground />
      <Navbar />

      <div className="pt-14 sm:pt-16">
        <HeroSection />
      </div>

      {/* CTA Cards */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-5">
          {/* Chat CTA */}
          <Link
            to="/login"
            className="group glass-strong rounded-2xl p-8 text-center border border-primary/20 hover:border-primary/50 hover:neon-box transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
              <MessageSquare size={22} className="text-primary" />
            </div>
            <h3 className="font-display text-sm font-bold text-primary neon-text mb-2 tracking-wide">
              START SOLVING
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Jump into the AI-powered math chat. Step-by-step solutions with
              interactive graphs.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-display tracking-wider text-primary/70 group-hover:text-primary transition-colors">
              OPEN CHAT →
            </div>
          </Link>

          {/* Docs CTA */}
          <Link
            to="/docs"
            className="group glass-strong rounded-2xl p-8 text-center border border-border/40 hover:border-primary/30 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
              <FileText
                size={22}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground mb-2 tracking-wide group-hover:text-primary transition-colors">
              EXPLORE DOCS
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Learn how it works, explore capabilities, read about the project,
              and reach out.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-display tracking-wider text-muted-foreground/60 group-hover:text-primary transition-colors">
              VIEW DOCS →
            </div>
          </Link>
        </div>
      </div>

      <footer className="relative z-10 py-16 border-t border-border/10 bg-black/20 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          {/* Logo / Brand Mark */}
          <div className="mb-10 group cursor-default">
            <div className="flex flex-col items-center gap-2 opacity-70 group-hover:opacity-100 transition-all duration-700">
              <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center group-hover:border-primary/50 group-hover:neon-box group-hover:scale-110 transition-all duration-500">
                <img
                  src="/logo.png"
                  alt=""
                  className="w-5 h-5 grayscale-[0.5] group-hover:grayscale-0 transition-all"
                />
              </div>
              <span className="font-display text-[10px] tracking-[0.5em] text-primary font-black uppercase">
                LOGICIA
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-sm">
            <p className="font-display text-[9px] sm:text-[10px] tracking-[0.4em] text-muted-foreground/90 uppercase leading-relaxed font-medium">
              Intelligent logic brain for India's competitive exams
            </p>
            <div className="h-4 w-px bg-gradient-to-b from-primary/40 to-transparent mx-auto" />
            <p className="font-body text-[10px] sm:text-[11px] text-muted-foreground/60 flex items-center gap-2 flex-wrap justify-center leading-relaxed max-w-sm sm:max-w-none">
              <span>© {new Date().getFullYear()} LOGICIA</span>
              <span className="w-1 h-1 rounded-full bg-border/40 hidden xs:inline" />
              <span>
                Designed & Engineered with{" "}
                <span className="text-primary/60">💚</span> by{" "}
                <span className="text-primary/80 font-medium">VARA</span> for
                the aspirants of India
              </span>
            </p>
          </div>

          {/* Minimal Links */}
          <div className="mt-12 flex items-center gap-6 sm:gap-8 flex-wrap justify-center text-[9px] font-display tracking-[0.25em] text-muted-foreground/50">
            <Link
              to="/login"
              className="hover:text-primary transition-colors hover:tracking-[0.35em] duration-300"
            >
              CHAT
            </Link>
            <span className="w-1 h-1 rounded-full bg-border/40" />
            <Link
              to="/docs"
              className="hover:text-primary transition-colors hover:tracking-[0.35em] duration-300"
            >
              DOCS
            </Link>
            <span className="w-1 h-1 rounded-full bg-border/40" />
            <Link
              to="/docs"
              state={{ section: "terms" }}
              className="hover:text-primary transition-colors hover:tracking-[0.35em] duration-300"
            >
              TERMS
            </Link>
            <span className="w-1 h-1 rounded-full bg-border/40" />
            <Link
              to="/docs"
              state={{ section: "privacy" }}
              className="hover:text-primary transition-colors hover:tracking-[0.35em] duration-300"
            >
              PRIVACY
            </Link>
          </div>
        </div>
      </footer>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 w-10 h-10 rounded-full border border-primary/50 bg-background/80 backdrop-blur flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
};

export default Index;

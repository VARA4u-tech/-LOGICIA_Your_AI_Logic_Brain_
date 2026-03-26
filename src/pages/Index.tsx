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
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
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
        <div className="h-full bg-primary neon-box transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
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
          <Link to="/chat" className="group glass-strong rounded-2xl p-8 text-center border border-primary/20 hover:border-primary/50 hover:neon-box transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
              <MessageSquare size={22} className="text-primary" />
            </div>
            <h3 className="font-display text-sm font-bold text-primary neon-text mb-2 tracking-wide">START SOLVING</h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Jump into the AI-powered math chat. Step-by-step solutions with interactive graphs.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-display tracking-wider text-primary/70 group-hover:text-primary transition-colors">
              OPEN CHAT →
            </div>
          </Link>

          {/* Docs CTA */}
          <Link to="/docs" className="group glass-strong rounded-2xl p-8 text-center border border-border/40 hover:border-primary/30 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
              <FileText size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground mb-2 tracking-wide group-hover:text-primary transition-colors">EXPLORE DOCS</h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Learn how it works, explore capabilities, read about the project, and reach out.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-display tracking-wider text-muted-foreground/60 group-hover:text-primary transition-colors">
              VIEW DOCS →
            </div>
          </Link>
        </div>
      </div>

      <footer className="relative z-10 text-center py-8 border-t border-border">
        <p className="font-body text-[10px] tracking-[0.3em] text-muted-foreground">LOGICIA — YOUR AI MATH BRAIN</p>
        <p className="font-body text-[9px] tracking-widest text-muted-foreground/40 mt-2">© {new Date().getFullYear()} · Built with ❤️ for math learners</p>
      </footer>

      <button onClick={scrollToTop} aria-label="Back to top"
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 w-10 h-10 rounded-full border border-primary/50 bg-background/80 backdrop-blur flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <ArrowUp size={16} />
      </button>
    </div>
  );
};

export default Index;

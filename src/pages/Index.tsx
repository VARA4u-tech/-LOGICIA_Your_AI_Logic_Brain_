import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ChatInterface from "@/components/ChatInterface";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import HowItWorksSection from "@/components/HowItWorksSection";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="relative min-h-screen">
      {/* Scroll progress bar — neon line at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div
          className="h-full bg-primary neon-box transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AnimatedBackground />
      <Navbar />

      {/* Page padding-top to account for fixed navbar */}
      <div className="pt-14 sm:pt-16">
        <HeroSection />
        <FeaturesSection />
        <ChatInterface />
        <HowItWorksSection />
        <AboutSection />
        <ContactSection />
      </div>

      <footer className="relative z-10 text-center py-8 sm:py-10 border-t border-border">
        <p className="font-body text-[10px] sm:text-xs tracking-[0.3em] text-muted-foreground">
          LOGICIA — YOUR AI MATH BRAIN
        </p>
        <p className="font-body text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/40 mt-2">
          © {new Date().getFullYear()} · Built with ❤️ for math learners
        </p>
      </footer>

      {/* Back to top FAB */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/50 bg-background/80 backdrop-blur flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp size={16} className="sm:hidden" />
        <ArrowUp size={18} className="hidden sm:block" />
      </button>
    </div>
  );
};

export default Index;

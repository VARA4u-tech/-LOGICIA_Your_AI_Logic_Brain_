import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const subtitles = [
  "Your AI Math Brain.",
  "Step-by-Step Solutions.",
  "Instant Complex Calculus.",
  "Zero Guesswork. Just Logic."
];

const HeroSection = () => {
  const [textIndex, setTextIndex] = useState(0);

  // Rotating subtitle effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % subtitles.length);
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50 sm:opacity-60 mix-blend-screen scale-105 animate-slow-pan"
        width={1920}
        height={1080}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />

      {/* Flare effects (Centered radial glow) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full animate-pulse-glow"
        style={{ background: "radial-gradient(circle, hsl(120 100% 54% / 0.15) 0%, transparent 70%)" }}
      />

      {/* Star flares at heading corners */}
      <div className="absolute top-[35%] left-[10%] sm:left-[18%] w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-flare neon-box" />
      <div className="absolute top-[38%] right-[10%] sm:right-[18%] w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-flare neon-box" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-[60%] left-[20%] sm:left-[22%] w-1 sm:w-2 h-1 sm:h-2 rounded-full bg-primary animate-flare" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[52%] right-[15%] sm:right-[22%] w-1 sm:w-2 h-1 sm:h-2 rounded-full bg-primary animate-flare" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full flex flex-col items-center animate-fade-in-up mt-10 sm:mt-0">
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-primary neon-text-strong tracking-tighter sm:tracking-normal leading-[0.85] sm:leading-none select-none">
          LOGICIA
        </h1>

        {/* Rotating subtitle wrapper to prevent layout shift */}
        <div className="h-8 sm:h-10 md:h-12 mt-4 sm:mt-6 md:mt-8 flex items-center justify-center overflow-hidden">
          <p 
            key={textIndex}
            className="font-body text-[10px] sm:text-xs md:text-sm lg:text-base tracking-[0.3em] sm:tracking-[0.4em] text-secondary-foreground font-light uppercase animate-fade-in-up"
            style={{ animationDuration: "0.8s" }}
          >
            {subtitles[textIndex]}
          </p>
        </div>

        <a
          href="#chat"
          className="group relative inline-flex items-center justify-center mt-10 sm:mt-12 md:mt-16 px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 border border-primary/50 bg-primary/5 rounded font-display text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-primary transition-all duration-300 hover:scale-[1.03] overflow-hidden"
        >
          {/* Hover glow background */}
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          
          <span className="relative z-10 group-hover:neon-text transition-all duration-300 flex items-center gap-2 sm:gap-3">
            START SOLVING
            {/* Arrow icon */}
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          
          {/* Default outer box glow on hover happens via standard CSS */}
          <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/80 group-hover:neon-box rounded transition-all duration-300" />
        </a>

      </div>
      
      {/* Scroll indicator (mouse or arrow) at bottom - moved outside content div for proper vp anchoring */}
      <a 
        href="#features" 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 group opacity-40 hover:opacity-100 transition-all duration-500 animate-bounce cursor-pointer"
      >
        <span className="font-display text-[8px] sm:text-[9px] tracking-[0.4em] text-primary group-hover:neon-text transition-all">SCROLL</span>
        <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-primary via-primary/40 to-transparent group-hover:h-16 sm:group-hover:h-20 transition-all duration-500" />
      </a>
    </section>
  );
};

export default HeroSection;

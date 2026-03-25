import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        width={1920}
        height={1080}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />

      {/* Flare effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-glow"
        style={{ background: "radial-gradient(circle, hsl(120 100% 54% / 0.12) 0%, transparent 60%)" }}
      />

      {/* Star flares at heading corners */}
      <div className="absolute top-[38%] left-[18%] w-3 h-3 rounded-full bg-primary animate-flare neon-box hidden lg:block" />
      <div className="absolute top-[38%] right-[18%] w-3 h-3 rounded-full bg-primary animate-flare neon-box hidden lg:block" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-[52%] left-[22%] w-2 h-2 rounded-full bg-primary animate-flare hidden lg:block" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[52%] right-[22%] w-2 h-2 rounded-full bg-primary animate-flare hidden lg:block" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-primary neon-text-strong animate-pulse-glow leading-none">
          LOGICIA
        </h1>

        <p className="mt-6 md:mt-8 font-body text-sm sm:text-base md:text-lg tracking-[0.4em] text-secondary-foreground font-light uppercase">
          Your AI Math Brain.
        </p>

        <a
          href="#chat"
          className="inline-block mt-10 md:mt-14 px-10 py-4 border border-primary/50 rounded-sm font-display text-sm tracking-[0.3em] text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-105"
        >
          START SOLVING
        </a>
      </div>
    </section>
  );
};

export default HeroSection;

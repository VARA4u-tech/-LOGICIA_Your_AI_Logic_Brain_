import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const subtitles = [
  "Your AI Exam Brain.",
  "UPSC · SSC · Banking · Railways.",
  "GK, Reasoning & Math — All Exams.",
  "Think Smart. Score Higher.",
  "Step-by-Step. Zero Guesswork.",
];

export default function HeroSection() {
  const [textIndex, setTextIndex] = useState(0);

  // Rotating subtitle effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % subtitles.length);
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* 📥 Background Image Layer */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.65] mix-blend-luminosity scale-110 animate-slow-pan"
        width={1920}
        height={1080}
      />

      {/* 🔳 Mathematical Grid Overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(120 100% 54% / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(120 100% 54% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 🌑 Base Gradient Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-[2]" />

      {/* 🔮 Dynamic Ambient Glows */}
      <div
        className="absolute top-1/4 -left-20 w-[400px] h-[400px] sm:w-[800px] sm:h-[800px] rounded-full blur-[120px] animate-pulse-glow z-[2]"
        style={{
          background:
            "radial-gradient(circle, hsl(120 100% 54% / 0.12) 0%, transparent 70%)",
          animationDuration: "10s",
        }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full blur-[100px] animate-pulse-glow z-[2]"
        style={{
          background:
            "radial-gradient(circle, hsl(200 100% 54% / 0.12) 0%, transparent 70%)",
          animationDuration: "12s",
          animationDelay: "1s",
        }}
      />
      {/* 🔮 Center Mobile/Tablet Glow - Added for better background fill */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] rounded-full blur-[110px] animate-pulse-glow z-[2] lg:hidden"
        style={{
          background:
            "radial-gradient(circle, hsl(120 100% 54% / 0.1) 0%, transparent 75%)",
          animationDuration: "15s",
        }}
      />

      {/* 📐 Abstract Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
        {/* Large Rotating Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[900px] sm:h-[900px] border border-primary/[0.03] rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] border border-primary/[0.02] rounded-full animate-reverse-spin-slow" />

        {/* Floating Accents */}
        <div className="absolute top-[20%] left-[15%] w-24 h-24 border border-primary/10 rounded-3xl rotate-12 animate-float opacity-20" />
        <div className="absolute bottom-[30%] right-[10%] w-32 h-32 border border-primary/5 rounded-full animate-float-delayed opacity-20" />
      </div>

      {/* ✨ Micro-Flares (Interactive feel) */}
      <div className="absolute top-[35%] left-[10%] sm:left-[18%] w-1 sm:w-2 h-1 sm:h-2 rounded-full bg-primary/40 animate-pulse-glow z-[4]" />
      <div
        className="absolute top-[38%] right-[10%] sm:right-[18%] w-1 sm:w-2 h-1 sm:h-2 rounded-full bg-primary/40 animate-pulse-glow z-[4]"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute top-[60%] left-[20%] sm:left-[22%] w-1 h-1 rounded-full bg-primary/20 animate-pulse-glow z-[4]"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-[52%] right-[15%] sm:right-[22%] w-1 h-1 rounded-full bg-primary/20 animate-pulse-glow z-[4]"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 w-full flex flex-col items-center animate-fade-in-up mt-10 sm:mt-0">
        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black text-primary neon-text-strong tracking-tighter sm:tracking-normal leading-[0.85] sm:leading-none select-none">
          LOGICIA
        </h1>

        {/* Rotating subtitle wrapper to prevent layout shift */}
        <div className="h-8 sm:h-10 md:h-12 mt-4 sm:mt-6 md:mt-8 flex items-center justify-center overflow-hidden">
          <p
            key={textIndex}
            className="font-body text-[10px] sm:text-xs md:text-sm lg:text-base tracking-[0.3em] sm:tracking-[0.4em] text-secondary-foreground/90 font-light uppercase animate-fade-in-up"
            style={{ animationDuration: "0.8s" }}
          >
            {subtitles[textIndex]}
          </p>
        </div>

        <a
          href="/chat"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/chat";
          }}
          className="group relative inline-flex items-center justify-center mt-10 sm:mt-12 md:mt-16 px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 border border-primary/50 bg-primary/5 rounded font-display text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] text-primary transition-all duration-300 hover:scale-[1.03] overflow-hidden"
        >
          {/* Hover glow background */}
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

          <span className="relative z-10 group-hover:neon-text transition-all duration-300 flex items-center gap-2 sm:gap-3">
            START SOLVING
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>

          <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/80 group-hover:neon-box rounded transition-all duration-300" />
        </a>
      </div>
    </section>
  );
}

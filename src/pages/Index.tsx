import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <HeroSection />
      <ChatInterface />

      {/* Footer */}
      <footer className="relative z-10 text-center py-10 border-t border-border">
        <p className="font-body text-xs tracking-[0.3em] text-muted-foreground">
          AI MATH ASSISTANT — POWERED BY INTELLIGENCE
        </p>
      </footer>
    </div>
  );
};

export default Index;

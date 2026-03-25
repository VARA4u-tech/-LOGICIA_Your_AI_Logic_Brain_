import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ChatInterface from "@/components/ChatInterface";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ChatInterface />
      <AboutSection />
      <ContactSection />

      <footer className="relative z-10 text-center py-10 border-t border-border">
        <p className="font-body text-xs tracking-[0.3em] text-muted-foreground">
          LOGICIA — YOUR AI MATH BRAIN
        </p>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "HOME", href: "#home" },
  { label: "FEATURES", href: "#features" },
  { label: "CHAT", href: "#chat" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = navItems.map((n) => n.href.slice(1));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35, rootMargin: "-10% 0px -60% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const closeMobile = () => setOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-lg shadow-black/30 py-0" : "glass py-0"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"
        }`}
      >
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2 group"
          onClick={closeMobile}
        >
          <img
            src="/logo.png"
            alt="Logicia"
            className={`transition-all duration-300 ${scrolled ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"}`}
          />
          <span
            className={`font-display font-bold tracking-wider text-primary neon-text transition-all duration-300 ${
              scrolled ? "text-xs sm:text-sm" : "text-sm sm:text-base"
            }`}
          >
            LOGICIA
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.label}
                href={item.href}
                className={`relative font-body text-[10px] lg:text-xs tracking-[0.25em] transition-all duration-300 group ${
                  isActive ? "text-primary neon-text" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
                {/* Active underline indicator */}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 ${
                    isActive ? "w-full neon-box" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((p) => !p)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden text-primary p-1.5 rounded border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu — animated slide-down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass-strong border-t border-border px-4 pb-4 pt-2 space-y-1">
          {navItems.map((item, i) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                style={{ animationDelay: `${i * 0.05}s` }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm tracking-[0.2em] transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

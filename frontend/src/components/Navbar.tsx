import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, FileText, MessageSquare, LogOut, LogIn } from "lucide-react";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("logicia_token");
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync auth state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("logicia_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const closeMobile = () => setOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("logicia_token");
    localStorage.removeItem("logicia_user");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg shadow-black/30" : "glass"}`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"}`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={closeMobile}
        >
          <img
            src="/logo.png"
            alt="Logicia"
            className={`transition-all duration-300 ${scrolled ? "w-6 h-6 sm:w-7 sm:h-7" : "w-7 h-7 sm:w-8 sm:h-8"}`}
          />
          <span
            className={`font-display font-bold tracking-wider text-primary neon-text transition-all duration-300 ${scrolled ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}
          >
            LOGICIA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/docs"
            className="flex items-center gap-1.5 font-body text-[10px] lg:text-xs tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group"
          >
            <FileText
              size={12}
              className="group-hover:text-primary transition-colors"
            />
            DOCS
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className="flex items-center gap-1.5 font-display text-xs tracking-[0.2em] px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200"
                style={{ boxShadow: "0 0 20px hsl(120 100% 54% / 0.35)" }}
              >
                <MessageSquare size={13} />
                START CHAT
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-display text-[10px] tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors px-2"
              >
                <LogOut size={12} />
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 font-display text-xs tracking-[0.2em] px-5 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 active:scale-95"
            >
              <LogIn size={13} />
              LOGIN
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <Link
              to="/chat"
              className="flex items-center gap-1 text-[10px] font-display tracking-wider text-primary-foreground bg-primary px-3 py-1.5 rounded-lg transition-all"
              style={{ boxShadow: "0 0 12px hsl(120 100% 54% / 0.3)" }}
            >
              <MessageSquare size={11} />
              CHAT
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 font-display text-[10px] tracking-wider text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
            >
              <LogIn size={11} />
              LOGIN
            </Link>
          )}
          <button
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? "Close" : "Open menu"}
            className="text-primary p-2 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="glass-strong border-t border-border px-4 pb-4 pt-3 space-y-2">
          <Link
            to="/docs"
            onClick={closeMobile}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <FileText size={15} />
            DOCS
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => { handleLogout(); closeMobile(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm tracking-[0.2em] text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut size={15} />
              LOGOUT
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { Bot, Cpu, Sparkles, LogIn, ShieldCheck, ArrowRight, BrainCircuit } from "lucide-react";
import Navbar from "@/components/Navbar";

interface LocationState {
  from?: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (localStorage.getItem("logicia_token")) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleGoogleSuccess = async (tokenResponse: TokenResponse) => {
    setIsLoggingIn(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("logicia_token", data.access_token);
        if (data.user) {
          localStorage.setItem("logicia_user", JSON.stringify(data.user));
        }
        setIsSuccess(true);
        // Seamless redirect to previous page or chat
        setTimeout(() => {
          const from = state?.from || "/chat";
          navigate(from);
        }, 1200);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log("Login Failed"),
  });

  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/30 selection:text-primary overflow-hidden relative">
      <Navbar />
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 h-screen flex flex-col items-center justify-center pt-20">
        
        {/* Auth Container */}
        <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
          
          {/* Left Side: Branding/Visuals */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                  <BrainCircuit className="text-primary w-6 h-6" />
                </div>
                <span className="font-display font-black tracking-[0.3em] text-primary neon-text">LOGICIA</span>
              </div>
              
              <h1 className="text-4xl font-display font-black tracking-tight text-white mb-6 leading-tight">
                Empower Your <span className="text-primary italic">Intelligence</span> with Logicia AI.
              </h1>
              
              <ul className="space-y-4">
                {[
                  { icon: <Cpu className="w-4 h-4" />, text: "Step-by-step Math Intelligence" },
                  { icon: <Sparkles className="w-4 h-4" />, text: "Competitive Exam Specialists" },
                  { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure Google Authentication" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground/80 font-display text-xs tracking-widest uppercase">
                    <span className="text-primary">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            


            {/* Subtle Tech Circle Animation */}
            <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 rounded-full border border-primary/10 animate-spin-slow" />
          </div>

          {/* Right Side: Login Form */}
          <div className="p-8 sm:p-16 flex flex-col items-center justify-center relative bg-white/[0.02]">
            <div className="lg:hidden mb-8 text-center">
               <div className="flex items-center gap-2 mb-2 justify-center">
                  <img src="/logo.png" className="w-8 h-8" alt="Logo" />
                  <span className="font-display font-bold tracking-widest text-primary">LOGICIA</span>
               </div>
            </div>

            <div className="w-full max-w-sm text-center lg:text-left space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                  Welcome to <span className="text-primary neon-text">Logic</span>.
                </h2>
                <p className="text-muted-foreground font-body text-[14px] leading-relaxed">
                  Join the elite group of students using AI to master complex mathematical challenges.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => login()}
                  disabled={isLoggingIn || isSuccess}
                  className="group relative w-full flex items-center justify-center gap-4 px-8 py-5 rounded-[1.5rem] bg-white text-black font-display text-xs tracking-[0.1em] font-black transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:grayscale overflow-hidden"
                  style={{ boxShadow: isSuccess ? '0 0 30px #12ff12' : '0 10px 40px rgba(255,255,255,0.1)' }}
                >
                  {isSuccess ? (
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="w-5 h-5 animate-bounce" />
                      <span>ACCESS GRANTED</span>
                    </div>
                  ) : isLoggingIn ? (
                    <div className="flex items-center gap-3">
                       <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                       <span>AUTHENTICATING...</span>
                    </div>
                  ) : (
                    <>
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                      <span>CONTINUE WITH GOOGLE</span>
                      <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  
                  {/* Subtle Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </button>
                
                <p className="text-[10px] text-center font-display tracking-widest text-muted-foreground/50 uppercase">
                  Logicia uses 256-bit encryption for secure sessions.
                </p>
              </div>

              {/* Bottom Decoration */}
              <div className="pt-12 flex justify-center lg:justify-start gap-8 opacity-20 grayscale hover:opacity-50 transition-all duration-500">
                <div className="flex items-center gap-2 text-[10px] font-display tracking-widest"><Cpu size={12}/> AI ENGINE</div>
                <div className="flex items-center gap-2 text-[10px] font-display tracking-widest"><ShieldCheck size={12}/> RSA SECURE</div>
              </div>
            </div>
            
            {/* Visual element for mobile */}
            <div className="lg:hidden absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-[11px] font-display tracking-widest text-muted-foreground/40 uppercase">
          &copy; 2026 Logicia Intelligence Systems. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;

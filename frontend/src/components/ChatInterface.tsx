import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import SolutionPanel from "./SolutionPanel";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Step {
  label: string;
  math: string;
  explanation?: string;
}

interface PlotData {
  x: number;
  y: number;
}

interface SolutionData {
  method?: string;
  steps: Step[];
  finalAnswer: string;
  graphData?: PlotData[];
}

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  solution?: SolutionData;
}

/* ─── Quick-prompt chips ─────────────────────────────────────────────────── */
const QUICK_PROMPTS = [
  { label: "2 + 2", prompt: "2 + 2" },
  { label: "x² − 5x + 6 = 0", prompt: "solve quadratic x^2 - 5x + 6" },
  { label: "d/dx of x²", prompt: "derivative of x²" },
  { label: "∫ x dx", prompt: "integral of x" },
  { label: "15 × 7 + 3", prompt: "15 * 7 + 3" },
  { label: "100 ÷ 4 − 8", prompt: "100 / 4 - 8" },
];

const MAX_CHARS = 300;
const STORAGE_KEY = "logicia_chat_history";
const LANG_KEY = "logicia_language";

/* ─── UI Translations ────────────────────────────────────────────────────── */
const UI_STRINGS = {
  en: {
    welcome: "Welcome! I'm your **AI Math Assistant**. Enter any math problem and I'll solve it step by step with interactive visualizations. 🧮",
    chat_interface: "CHAT INTERFACE",
    tagline: "Step-by-step solutions with interactive visualizations",
    solver_version: "LOGICIA SOLVER v1.0",
    clear_session: "CLEAR SESSION",
    neural_comp: "NEURAL COMPUTATION IN PROGRESS...",
    tutor_suggestions: "TUTOR SUGGESTIONS",
    placeholder: "Ask a question (e.g., solve x² + 2x + 1)...",
    error_backend: "⚠️ Error: {msg}. Please ensure the backend is running.",
  },
  te: {
    welcome: "స్వాగతం! నేను మీ **AI గణిత సహాయకుడిని**. ఏదైనా గణిత సమస్యను నమోదు చేయండి మరియు నేను దానిని ఇంటరాక్టివ్ విజువలైజేషన్‌లతో దశలవారీగా పరిష్కరిస్తాను. 🧮",
    chat_interface: "చాట్ ఇంటర్ఫేస్",
    tagline: "ఇంటరాక్టివ్ విజువలైజేషన్లతో దశలవారీ పరిష్కారాలు",
    solver_version: "లాజిషియా సాల్వర్ v1.0",
    clear_session: "సెషన్‌ను క్లియర్ చేయి",
    neural_comp: "న్యూరల్ కంప్యూటేషన్ పురోగతిలో ఉంది...",
    tutor_suggestions: "ట్యూటర్ సూచనలు",
    placeholder: "ఒక ప్రశ్న అడగండి (ఉదా., x² + 2x + 1 సాధించండి)...",
    error_backend: "⚠️ లోపం: {msg}. దయచేసి బ్యాకెండ్ నడుస్తుందో లేదో తనిఖీ చేయండి.",
  }
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const getInitialMessage = (lang: "en" | "te"): Message => ({
  id: 0,
  role: "ai",
  content: UI_STRINGS[lang].welcome,
});

const loadHistory = (lang: "en" | "te"): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch {
    /* ignore */
  }
  return [getInitialMessage(lang)];
};

const ChatInterface = () => {
  const [language, setLanguage] = useState<"en" | "te">(
    () => (localStorage.getItem(LANG_KEY) as "en" | "te") ?? "en"
  );
  const [messages, setMessages] = useState<Message[]>(() => loadHistory(
    (localStorage.getItem(LANG_KEY) as "en" | "te") ?? "en"
  ));

  // Persist language and reset welcome message on language switch
  const handleLanguageChange = (lang: "en" | "te") => {
    if (lang === language) return;
    localStorage.setItem(LANG_KEY, lang);
    setLanguage(lang);
    // Update the first (welcome) message to the new language
    setMessages(prev => {
      const rest = prev.filter(m => m.id !== 0);
      return [getInitialMessage(lang), ...rest];
    });
  };
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isFirstRender = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText || isTyping) return;

      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: trimmedText,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await fetch("http://localhost:8000/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("logicia_token") || ""}`,
          },
          body: JSON.stringify({
            content: trimmedText,
            mode: "pedagogical",
            language: language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to connect to Logicia brain.");
        }

        const data = await response.json();
        
        const aiMsg: Message = {
          id: data.message.id,
          role: "ai",
          content: data.message.content,
          solution: data.message.solution,
        };
        
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "ai",
            content: UI_STRINGS[language].error_backend.replace("{msg}", errorMessage),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, language],
  );

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    const initMsg = getInitialMessage(language);
    setMessages([initMsg]);
    localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  };

  const renderContent = (content: string) =>
    content.split("**").map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="text-primary font-semibold">
          {part}
        </strong>
      ) : (
        <span key={j}>{part}</span>
      ),
    );

  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;
  const showCounter = input.length > MAX_CHARS * 0.7;
  const ui = UI_STRINGS[language];

  return (
    <section id="chat" className="relative z-10 py-16 sm:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          {ui.chat_interface}
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-8 sm:mb-12">
          {ui.tagline}
        </p>

        <div className="glass-strong rounded-xl overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-500 shadow-2xl shadow-black/50">
          {/* Chat toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-black/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-display text-[10px] sm:text-xs tracking-[0.2em] text-primary/80">
                {ui.solver_version}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-black/40 p-1 rounded-lg border border-border">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-3 py-1 rounded-md text-[10px] font-display transition-all ${language === "en" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange("te")}
                  className={`px-3 py-1 rounded-md text-[10px] font-display transition-all ${language === "te" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                >
                  తెలుగు
                </button>
              </div>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs font-display tracking-wider text-muted-foreground hover:text-destructive transition-colors duration-200 border border-border hover:border-destructive/50 rounded-lg px-3 py-1.5"
              >
                <Trash2 size={12} />
                <span className="hidden sm:inline">{ui.clear_session}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[450px] sm:h-[550px] md:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary/10 border border-primary/30 text-primary neon-box"
                      : "glass border-border text-foreground shadow-lg"
                  }`}
                >
                  {renderContent(msg.content)}
                  {msg.solution && (
                    <SolutionPanel
                      steps={msg.solution.steps}
                      finalAnswer={msg.solution.finalAnswer}
                      method={msg.solution.method}
                      graphData={msg.solution.graphData}
                    />
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="glass border-border p-4 sm:p-5 rounded-xl w-full sm:w-2/3 md:w-[60%] space-y-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted animate-pulse mt-0.5" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-2 w-24 bg-muted rounded animate-pulse" />
                          <div className="h-7 w-full bg-primary/10 border border-primary/20 rounded animate-pulse shadow-inner" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="font-body text-[9px] sm:text-[10px] text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      {ui.neural_comp}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-4 sm:px-6 py-4 border-t border-border/50 bg-black/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={11} className="text-primary/70 animate-pulse" />
              <span className="font-display text-[9px] sm:text-[10px] tracking-[0.2em] text-primary/60">
                {ui.tutor_suggestions}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.prompt}
                  onClick={() => sendMessage(qp.prompt)}
                  disabled={isTyping}
                  className="font-mono text-[9px] sm:text-[10px] px-3 py-1.5 rounded-lg border border-primary/10 bg-primary/5 text-primary/70 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 disabled:opacity-40 whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 sm:p-5 bg-black/20">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value.slice(0, MAX_CHARS + 20))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={ui.placeholder}
                  maxLength={MAX_CHARS + 20}
                  className={`w-full bg-muted/20 border rounded-2xl px-5 py-3.5 sm:py-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 font-body pr-16 shadow-inner ${
                    isOverLimit
                      ? "border-destructive focus:border-destructive"
                      : "border-border/50 focus:border-primary focus:neon-box"
                  }`}
                />
                {showCounter && (
                  <span
                    className={`absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] tabular-nums ${isOverLimit ? "text-destructive" : "text-primary/60"}`}
                  >
                    {charsLeft}
                  </span>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim() || isOverLimit}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-primary/50 bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:neon-box transition-all duration-300 hover:scale-105 disabled:opacity-30 flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;

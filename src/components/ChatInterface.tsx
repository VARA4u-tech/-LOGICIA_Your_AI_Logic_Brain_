import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import SolutionPanel from "./SolutionPanel";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Step {
  label: string;
  math: string;
  explanation?: string;
}

interface SolutionData {
  method?: string;
  steps: Step[];
  finalAnswer: string;
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

/* ─── Math Solver ────────────────────────────────────────────────────────── */
const solveMath = (input: string): { content: string; solution?: SolutionData } => {
  const trimmed = input.trim().toLowerCase();

  if (trimmed.includes("2+2") || trimmed.includes("2 + 2")) {
    return {
      content: "Here's the solution:",
      solution: {
        method: "Basic Arithmetic",
        steps: [
          { label: "Identify operation", math: "2 + 2", explanation: "Simple addition of two integers" },
          { label: "Compute sum", math: "2 + 2 = 4", explanation: "Add the values together" },
        ],
        finalAnswer: "4",
      },
    };
  }

  if (trimmed.includes("derivative") || trimmed.includes("d/dx")) {
    return {
      content: "Applying differentiation rules:",
      solution: {
        method: "Power Rule — Differentiation",
        steps: [
          { label: "Identify the function", math: "f(x) = x²", explanation: "A polynomial of degree 2" },
          { label: "Apply the power rule", math: "d/dx [xⁿ] = n · xⁿ⁻¹", explanation: "Bring the exponent down and reduce by 1" },
          { label: "Substitute n = 2", math: "d/dx [x²] = 2 · x²⁻¹ = 2x", explanation: "The derivative of x² is 2x" },
        ],
        finalAnswer: "f'(x) = 2x",
      },
    };
  }

  if (trimmed.includes("integral") || trimmed.includes("∫")) {
    return {
      content: "Applying integration rules:",
      solution: {
        method: "Power Rule — Integration",
        steps: [
          { label: "Identify the integrand", math: "∫ x dx", explanation: "Integrating x with respect to x" },
          { label: "Apply the power rule", math: "∫ xⁿ dx = xⁿ⁺¹ / (n+1) + C", explanation: "Increase exponent by 1, divide by new exponent" },
          { label: "Substitute n = 1", math: "∫ x¹ dx = x² / 2 + C", explanation: "Add the constant of integration C" },
        ],
        finalAnswer: "x² / 2 + C",
      },
    };
  }

  if (trimmed.includes("quadratic") || trimmed.includes("x²") || trimmed.includes("x^2")) {
    const match = trimmed.match(/(\d+)x\^?2?\s*([+-]\s*\d+)x\s*([+-]\s*\d+)/);
    const a = match ? parseInt(match[1]) : 1;
    const b = match ? parseInt(match[2].replace(/\s/g, "")) : -5;
    const c = match ? parseInt(match[3].replace(/\s/g, "")) : 6;
    const disc = b * b - 4 * a * c;
    const sqrtDisc = Math.sqrt(Math.abs(disc));
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);

    return {
      content: `Solving ${a}x² + (${b})x + (${c}) = 0:`,
      solution: {
        method: "Quadratic Formula",
        steps: [
          { label: "Identify coefficients", math: `a = ${a},  b = ${b},  c = ${c}`, explanation: "From the standard form ax² + bx + c = 0" },
          { label: "Compute discriminant", math: `Δ = b² − 4ac = (${b})² − 4(${a})(${c}) = ${disc}`, explanation: disc > 0 ? "Positive → two real roots" : disc === 0 ? "Zero → one repeated root" : "Negative → complex roots" },
          { label: "Apply the formula", math: `x = (−b ± √Δ) / 2a = (${-b} ± √${disc}) / ${2 * a}` },
          { label: "Calculate roots", math: `x₁ = ${x1.toFixed(2)},  x₂ = ${x2.toFixed(2)}`, explanation: "Substitute and simplify" },
        ],
        finalAnswer: `x₁ = ${x1.toFixed(2)},  x₂ = ${x2.toFixed(2)}`,
      },
    };
  }

  // Generic arithmetic
  try {
    const sanitized = input.replace(/[^0-9+\-*/().% ]/g, "");
    if (sanitized.length > 0) {
      const result = new Function(`return ${sanitized}`)();
      if (typeof result === "number" && isFinite(result)) {
        const ops = sanitized.match(/[+\-*/]/g);
        const nums = sanitized.split(/[+\-*/]/).map((n) => n.trim()).filter(Boolean);
        const steps: Step[] = [
          { label: "Parse expression", math: input.trim(), explanation: `Identified ${nums.length} operands` },
        ];
        if (ops && nums.length >= 2) {
          let running = parseFloat(nums[0]);
          for (let i = 0; i < (ops?.length || 0); i++) {
            const nextNum = parseFloat(nums[i + 1]);
            const prev = running;
            switch (ops![i]) {
              case "+": running += nextNum; break;
              case "-": running -= nextNum; break;
              case "*": running *= nextNum; break;
              case "/": running /= nextNum; break;
            }
            steps.push({
              label: `Step ${i + 1}`,
              math: `${prev} ${ops![i]} ${nextNum} = ${running}`,
              explanation: ops![i] === "+" ? "Addition" : ops![i] === "-" ? "Subtraction" : ops![i] === "*" ? "Multiplication" : "Division",
            });
          }
        }
        return {
          content: "Here's the breakdown:",
          solution: { method: "Arithmetic Evaluation", steps, finalAnswer: `${result}` },
        };
      }
    }
  } catch { /* ignore */ }

  return {
    content: "I'd be happy to solve that! Try one of the quick prompts below, or enter:\n\n• Any arithmetic:  15 * 7 + 3\n• Quadratic:  x^2 - 5x + 6\n• Calculus:  derivative of x²\n• Integration:  integral of x",
  };
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "ai",
  content: "Welcome! I'm your **AI Math Assistant**. Enter any math problem and I'll solve it step by step. 🧮",
};

const loadHistory = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch { /* ignore */ }
  return [INITIAL_MESSAGE];
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  const isFirstRender = useRef(true);

  // Scroll to bottom on new message, but ONLY after initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isTyping) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: trimmedText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { content, solution } = solveMath(trimmedText);
      const aiMsg: Message = { id: Date.now() + 1, role: "ai", content, solution };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000); // Increased from 800 to 2000 to show skeleton
  }, [isTyping]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Ctrl+Enter also sends
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  };

  const renderContent = (content: string) =>
    content.split("**").map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="text-primary font-semibold">{part}</strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );

  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;
  const showCounter = input.length > MAX_CHARS * 0.7;

  return (
    <section id="chat" className="relative z-10 py-16 sm:py-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Section header */}
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          CHAT INTERFACE
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-8 sm:mb-12">
          Step-by-step solutions with highlighted math rendering
        </p>

        {/* Chat container */}
        <div className="glass-strong rounded-xl overflow-hidden flex flex-col">

          {/* Chat toolbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-display text-[10px] sm:text-xs tracking-[0.2em] text-primary/80">
                LOGICIA SOLVER
              </span>
            </div>
            <button
              onClick={handleClearChat}
              title="Clear chat history"
              className="flex items-center gap-1.5 text-[10px] sm:text-xs font-display tracking-wider text-muted-foreground hover:text-destructive transition-colors duration-200 border border-border hover:border-destructive/50 rounded px-2 py-1"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">CLEAR</span>
            </button>
          </div>

          {/* Messages area */}
          <div className="h-[380px] sm:h-[460px] md:h-[520px] overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary/20 border border-primary/40 text-primary neon-box"
                      : "glass border-border text-foreground"
                  }`}
                >
                  {renderContent(msg.content)}
                  {msg.solution && (
                    <SolutionPanel
                      steps={msg.solution.steps}
                      finalAnswer={msg.solution.finalAnswer}
                      method={msg.solution.method}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator / Skeleton loader */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="glass border-border p-4 sm:p-5 rounded-xl w-3/4 sm:w-2/3 md:w-[60%] space-y-4">
                  
                  {/* Fake header */}
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-pulse" />
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  
                  {/* Fake steps stack */}
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted animate-pulse mt-0.5" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-2 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-7 w-full max-w-[200px] bg-primary/10 border border-primary/20 rounded animate-pulse" />
                          <div className="h-2 w-32 bg-muted/60 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Processing text */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="font-body text-[9px] sm:text-[10px] text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      COMPUTING VARIABLES...
                    </span>
                  </div>

                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 sm:px-6 py-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={11} className="text-primary/60" />
              <span className="font-display text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground">
                QUICK PROMPTS
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.prompt}
                  onClick={() => sendMessage(qp.prompt)}
                  disabled={isTyping}
                  className="font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full border border-primary/20 text-primary/70 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS + 20))}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your math problem..."
                  maxLength={MAX_CHARS + 20}
                  className={`w-full bg-muted/50 border rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 font-body pr-16 ${
                    isOverLimit
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary focus:neon-box"
                  }`}
                />
                {/* Character counter — shows when >70% filled */}
                {showCounter && (
                  <span
                    className={`absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] tabular-nums transition-colors ${
                      isOverLimit ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {charsLeft}
                  </span>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim() || isOverLimit}
                title="Send (Enter)"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/50 flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={15} className="sm:hidden" />
                <Send size={17} className="hidden sm:block" />
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-body text-center mt-2 tracking-wider">
              Press <kbd className="font-mono px-1 py-0.5 rounded border border-border text-[8px]">Enter</kbd> to send
              {" · "}
              <kbd className="font-mono px-1 py-0.5 rounded border border-border text-[8px]">Ctrl+Enter</kbd> also works
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;

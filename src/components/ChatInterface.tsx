import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import SolutionPanel from "./SolutionPanel";

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
          { label: "Compute discriminant", math: `Δ = b² − 4ac = (${b})² − 4(${a})(${c}) = ${disc}`, explanation: disc > 0 ? "Positive discriminant → two real roots" : disc === 0 ? "Zero discriminant → one repeated root" : "Negative discriminant → complex roots" },
          { label: "Apply the formula", math: `x = (−b ± √Δ) / 2a = (${-b} ± √${disc}) / ${2 * a}` },
          { label: "Calculate roots", math: `x₁ = ${x1.toFixed(2)},  x₂ = ${x2.toFixed(2)}`, explanation: "Substitute and simplify" },
        ],
        finalAnswer: `x₁ = ${x1.toFixed(2)},  x₂ = ${x2.toFixed(2)}`,
      },
    };
  }

  // Simple arithmetic
  try {
    const sanitized = input.replace(/[^0-9+\-*/().% ]/g, "");
    if (sanitized.length > 0) {
      const result = new Function(`return ${sanitized}`)();
      if (typeof result === "number" && isFinite(result)) {
        // Build steps for arithmetic
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
          solution: {
            method: "Arithmetic Evaluation",
            steps,
            finalAnswer: `${result}`,
          },
        };
      }
    }
  } catch {}

  return {
    content: "I'd be happy to solve that! Try entering expressions like:\n\n• 2 + 2\n• derivative of x²\n• integral of x\n• quadratic formula\n• 15 * 7 + 3\n\nOr any arithmetic expression!",
  };
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", content: "Welcome! I'm your **AI Math Assistant**. Enter any math problem and I'll solve it step by step. 🧮" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { content, solution } = solveMath(input);
      const aiMsg: Message = { id: Date.now() + 1, role: "ai", content, solution };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const renderContent = (content: string) =>
    content.split("**").map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="text-primary font-semibold">{part}</strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );

  return (
    <section id="chat" className="relative z-10 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl text-center font-bold text-primary neon-text mb-4">
          CHAT INTERFACE
        </h2>
        <p className="text-center text-muted-foreground text-sm font-body tracking-wider mb-12">
          Step-by-step solutions with highlighted math rendering
        </p>

        <div className="glass-strong rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
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

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="glass border-border px-5 py-3 rounded-lg flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.15s" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Enter your math problem..."
                className="flex-1 bg-muted/50 border border-border rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box transition-all duration-300 font-body"
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;

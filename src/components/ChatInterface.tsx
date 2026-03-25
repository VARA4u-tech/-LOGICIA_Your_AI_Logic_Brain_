import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

const sampleResponses: Record<string, string> = {
  default: "I can help you with that! Please enter a math problem and I'll solve it step by step.",
};

const solveMath = (input: string): string => {
  const trimmed = input.trim().toLowerCase();

  if (trimmed.includes("2+2") || trimmed.includes("2 + 2")) {
    return "**Solution:**\n\n`2 + 2 = 4`\n\n✅ **Answer: 4**";
  }
  if (trimmed.includes("derivative") || trimmed.includes("d/dx")) {
    return "**Step-by-step:**\n\n1. Apply the power rule: d/dx [xⁿ] = n·xⁿ⁻¹\n2. For f(x) = x², f'(x) = 2x\n\n✅ **Answer: f'(x) = 2x**";
  }
  if (trimmed.includes("integral") || trimmed.includes("∫")) {
    return "**Step-by-step:**\n\n1. Apply the power rule for integration\n2. ∫ x dx = x²/2 + C\n\n✅ **Answer: x²/2 + C**";
  }
  if (trimmed.includes("quadratic") || trimmed.includes("x²") || trimmed.includes("x^2")) {
    return "**Using the Quadratic Formula:**\n\nx = (-b ± √(b²-4ac)) / 2a\n\nProvide coefficients a, b, c for a specific solution.\n\n✅ **Formula ready**";
  }

  // Try to evaluate simple expressions
  try {
    const sanitized = input.replace(/[^0-9+\-*/().% ]/g, "");
    if (sanitized.length > 0) {
      const result = new Function(`return ${sanitized}`)();
      if (typeof result === "number" && isFinite(result)) {
        return `**Solution:**\n\n\`${input.trim()} = ${result}\`\n\n✅ **Answer: ${result}**`;
      }
    }
  } catch {}

  return "I'd be happy to solve that! Try entering expressions like:\n\n• `2 + 2`\n• `derivative of x²`\n• `integral of x`\n• `quadratic formula`\n\nOr any arithmetic expression!";
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", content: "Welcome! I'm your **AI Math Assistant**. Enter any math problem and I'll solve it step by step. 🧮" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = { id: Date.now() + 1, role: "ai", content: solveMath(input) };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <section id="chat" className="relative z-10 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl text-center font-bold text-primary neon-text mb-12">
          CHAT INTERFACE
        </h2>

        {/* Chat container */}
        <div className="glass-strong rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[450px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary/20 border border-primary/40 text-primary neon-box"
                      : "glass border-border text-foreground"
                  }`}
                >
                  {msg.content.split("**").map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="text-primary font-semibold">{part}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}
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
                className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-110"
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

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BarChart2,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Bot,
  User as UserIcon,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  BookOpen,
  Globe,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AnimatedBackground from "@/components/AnimatedBackground";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type ResponseMode = "detailed" | "quick";

interface Step {
  label: string;
  math: string;
  explanation?: string;
  /** A callout note shown below the math expression — used for concept clarifications */
  note?: string;
  /** Numbered sub-steps rendered indented under this step */
  subSteps?: string[];
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
  mode?: ResponseMode;
}
interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  solution?: SolutionData;
  timestamp: Date;
  mode?: ResponseMode;
}
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

/* ═══════════════════════════════════════════════════════════════
   QUICK PROMPTS — moved to QUICK_PROMPTS_I18N below
═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "logicia_conversations";
const MODE_KEY = "logicia_response_mode";
const LANG_KEY = "logicia_language";
const MAX_CHARS = 500;

type Language = "en" | "te";

/* ═══════════════════════════════════════════════════════════════
   UI TRANSLATIONS
═══════════════════════════════════════════════════════════════ */
const UI_STRINGS: Record<Language, Record<string, string>> = {
  en: {
    new_conversation: "NEW CONVERSATION",
    no_conversations: "No conversations yet. Start one!",
    history: "HISTORY",
    back_to_home: "Back to Home",
    clear: "CLEAR",
    ask_anything: "Ask me anything math",
    ask_subtitle: "Solve equations, derivatives, integrals, and more — step by step.",
    placeholder_detailed: "Ask a math question…",
    placeholder_quick: "Ask for a quick answer…",
    enter_to_send: "Press",
    to_send: "to send ·",
    new_line: "for new line",
    computing: "Computing...",
    computing_fast: "Computing fast...",
    error_backend: "Sorry, I am having trouble connecting to the Logicia server right now. Please make sure the backend is running on :8000.",
    logicia_ai: "LOGICIA AI",
    you: "YOU",
    final_answer: "Final Answer",
    hide: "HIDE",
    show_steps: "SHOW STEPS",
    visualization: "VISUALIZATION",
    mode: "Mode",
    detailed: "DETAILED",
    quick: "QUICK",
    detailed_hint: "Full explanation + graph",
    quick_hint: "Exam-style · key logic only",
    new_conv_title: "New Conversation",
  },
  te: {
    new_conversation: "కొత్త సంభాషణ",
    no_conversations: "ఇంకా సంభాషణలు లేవు. ఒకటి ప్రారంభించండి!",
    history: "చరిత్ర",
    back_to_home: "హోమ్‌కి తిరిగి వెళ్ళు",
    clear: "క్లియర్",
    ask_anything: "ఏదైనా గణితం అడగండి",
    ask_subtitle: "సమీకరణాలు, డెరివేటివ్‌లు, ఇంటిగ్రల్‌లు మరియు మరిన్నింటిని దశలవారీగా పరిష్కరించండి.",
    placeholder_detailed: "ఒక గణిత ప్రశ్న అడగండి…",
    placeholder_quick: "శీఘ్ర సమాధానం కోసం అడగండి…",
    enter_to_send: "పంపడానికి",
    to_send: "నొక్కండి ·",
    new_line: "కొత్త పంక్తి కోసం",
    computing: "గణన జరుగుతోంది...",
    computing_fast: "వేగంగా గణన...",
    error_backend: "క్షమించండి, లాజిషియా సర్వర్‌కు కనెక్ట్ అవడంలో సమస్య ఉంది. దయచేసి బ్యాకెండ్ :8000 పోర్ట్‌లో నడుస్తుందో లేదో తనిఖీ చేయండి.",
    logicia_ai: "లాజిషియా AI",
    you: "మీరు",
    final_answer: "తుది సమాధానం",
    hide: "దాచు",
    show_steps: "దశలు చూపించు",
    visualization: "విజువలైజేషన్",
    mode: "మోడ్",
    detailed: "వివరంగా",
    quick: "శీఘ్రం",
    detailed_hint: "పూర్తి వివరణ + గ్రాఫ్",
    quick_hint: "పరీక్ష-శైలి · కీలక తర్కం మాత్రమే",
    new_conv_title: "కొత్త సంభాషణ",
  },
};

const QUICK_PROMPTS_I18N: Record<Language, { label: string; prompt: string }[]> = {
  en: [
    { label: "Solve x² − 5x + 6", prompt: "solve quadratic x^2 - 5x + 6" },
    { label: "Derivative of x²", prompt: "derivative of x²" },
    { label: "Integral of x", prompt: "integral of x" },
    { label: "Compute 125 × 4", prompt: "125 * 4" },
    { label: "What is 2 + 2?", prompt: "2 + 2" },
  ],
  te: [
    { label: "x² − 5x + 6 సాధించండి", prompt: "solve quadratic x^2 - 5x + 6" },
    { label: "x² డెరివేటివ్", prompt: "derivative of x²" },
    { label: "x ఇంటిగ్రల్", prompt: "integral of x" },
    { label: "125 × 4 గణించండి", prompt: "125 * 4" },
    { label: "2 + 2 ఎంత?", prompt: "2 + 2" },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════════ */
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
    >
      {copied ? (
        <Check size={13} className="text-primary" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
};

const MathBlock = ({ expr }: { expr: string }) => (
  <div className="flex items-center gap-2 my-1 min-w-0">
    <div className="font-mono text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-black/40 border border-primary/20 text-primary inline-block overflow-x-auto max-w-full whitespace-nowrap">
      {expr}
    </div>
    <CopyButton text={expr} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RESPONSE MODE TOGGLE
═══════════════════════════════════════════════════════════════ */
const ModeToggle = ({
  mode,
  onChange,
  t,
}: {
  mode: ResponseMode;
  onChange: (m: ResponseMode) => void;
  t: Record<string, string>;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground/50 uppercase hidden sm:inline">
      {t.mode}
    </span>
    <div className="flex items-center p-0.5 rounded-lg border border-border/50 bg-muted/10 gap-0.5">
      {/* Detailed */}
      <button
        onClick={() => onChange("detailed")}
        title="Detailed — full step-by-step explanation with graph"
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-display tracking-wider transition-all duration-200 min-h-[30px] ${
          mode === "detailed"
            ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_hsl(120_100%_54%/0.15)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
        }`}
      >
        <BookOpen size={11} className="flex-shrink-0" />
        <span>{t.detailed}</span>
      </button>

      {/* Quick */}
      <button
        onClick={() => onChange("quick")}
        title="Quick — exam-style: formula + answer, no extras"
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-display tracking-wider transition-all duration-200 min-h-[30px] ${
          mode === "quick"
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_hsl(45_100%_60%/0.15)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
        }`}
      >
        <Zap size={11} className="flex-shrink-0" />
        <span>{t.quick}</span>
      </button>
    </div>

    {/* Active mode hint */}
    <span className="text-[9px] text-muted-foreground/35 font-body hidden md:inline">
      {mode === "detailed" ? t.detailed_hint : t.quick_hint}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE TOGGLE
═══════════════════════════════════════════════════════════════ */
const LanguageToggle = ({
  language,
  onChange,
}: {
  language: Language;
  onChange: (l: Language) => void;
}) => (
  <div className="flex items-center gap-1.5">
    <Globe size={11} className="text-muted-foreground/50 flex-shrink-0" />
    <div className="flex items-center p-0.5 rounded-lg border border-border/50 bg-muted/10 gap-0.5">
      <button
        onClick={() => onChange("en")}
        className={`px-2.5 py-1.5 rounded-md text-[10px] sm:text-[11px] font-display tracking-wider transition-all duration-200 min-h-[30px] ${
          language === "en"
            ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_hsl(120_100%_54%/0.15)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange("te")}
        className={`px-2.5 py-1.5 rounded-md text-[10px] sm:text-[11px] font-display tracking-wider transition-all duration-200 min-h-[30px] ${
          language === "te"
            ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_hsl(120_100%_54%/0.15)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
        }`}
      >
        తెలుగు
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SOLUTION PANEL
═══════════════════════════════════════════════════════════════ */
const SolutionPanel = ({
  steps,
  finalAnswer,
  method,
  graphData,
  mode,
  t,
}: {
  steps: Step[];
  finalAnswer: string;
  method?: string;
  graphData?: PlotData[];
  mode?: ResponseMode;
  t: Record<string, string>;
}) => {
  const [expanded, setExpanded] = useState(true);
  const isQuick = mode === "quick";

  return (
    <div className="mt-3 sm:mt-4 space-y-3 border-t border-border/40 pt-3 sm:pt-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {method && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <Lightbulb size={12} className="text-primary flex-shrink-0" />
              <span className="tracking-wider uppercase font-display truncate text-[10px]">
                {method}
              </span>
            </div>
          )}
          {/* Mode badge on the response */}
          {isQuick ? (
            <span className="flex items-center gap-1 text-[9px] font-display tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              <Zap size={8} />
              {t.quick}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9px] font-display tracking-widest text-primary/70 bg-primary/5 border border-primary/15 rounded-full px-2 py-0.5">
              <BookOpen size={8} />
              {t.detailed}
            </span>
          )}
        </div>
        {!isQuick && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="ml-auto flex items-center gap-1 text-[10px] font-display tracking-widest text-primary/70 hover:text-primary transition-colors border border-primary/20 rounded-md px-2.5 py-1 hover:border-primary/40 flex-shrink-0 min-h-[30px]"
          >
            {expanded ? (
              <>
                <span>{t.hide}</span>
                <ChevronUp size={11} />
              </>
            ) : (
              <>
                <span>{t.show_steps}</span>
                <ChevronDown size={11} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Graph — only shown in detailed mode */}
      {!isQuick && graphData && graphData.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-primary/15 bg-black/30">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-border/30 text-[10px] text-muted-foreground font-display tracking-widest uppercase">
            <BarChart2 size={12} className="text-primary" /> {t.visualization}
          </div>
          <div className="h-[160px] sm:h-[200px] p-2 sm:p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(120 100% 54% / 0.08)"
                />
                <XAxis
                  dataKey="x"
                  stroke="hsl(120 20% 40%)"
                  fontSize={9}
                  tickFormatter={(v) => v.toFixed(1)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(120 20% 40%)"
                  fontSize={9}
                  tickFormatter={(v) => v.toFixed(1)}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(120 20% 6% / 0.95)",
                    borderColor: "hsl(120 100% 54% / 0.3)",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                  itemStyle={{ color: "hsl(120 100% 54%)" }}
                  cursor={{
                    stroke: "hsl(120 100% 54% / 0.4)",
                    strokeWidth: 1.5,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="hsl(120 100% 54%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "hsl(120 100% 54%)",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Steps */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight:
            isQuick || expanded ? `${steps.length * 300 + 400}px` : "0px",
          opacity: isQuick || expanded ? 1 : 0,
        }}
      >
        <div className="space-y-3 sm:space-y-4 py-1">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2.5 sm:gap-3 items-start">
              {/* Step number bubble */}
              <div
                className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[9px] sm:text-[10px] font-display mt-0.5 ${
                  isQuick
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    : "border-primary/30 bg-primary/5 text-primary"
                }`}
              >
                {i + 1}
              </div>

              <div className="flex-1 min-w-0 overflow-hidden space-y-1.5">
                {/* Step label */}
                <p
                  className={`text-[10px] tracking-wide uppercase font-display ${
                    isQuick ? "text-amber-400/60" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>

                {/* Math expression */}
                <MathBlock expr={step.math} />

                {/* Explanation — shown in both modes */}
                {step.explanation && (
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                    <ChevronRight size={9} className={`inline mr-1 ${isQuick ? "text-amber-400/60" : "text-primary"}`} />
                    {step.explanation}
                  </p>
                )}

                {/* Sub-steps (only in detailed mode) */}
                {!isQuick && step.subSteps && step.subSteps.length > 0 && (
                  <div className="mt-1.5 ml-1 pl-3 border-l border-primary/20 space-y-1">
                    {step.subSteps.map((sub, j) => (
                      <p key={j} className="text-[10px] sm:text-[11px] font-mono text-primary/70 leading-relaxed">
                        <span className="text-primary/40 mr-2 font-display">{String.fromCharCode(97 + j)})</span>
                        {sub}
                      </p>
                    ))}
                  </div>
                )}

                {/* Note callout (only in detailed mode) */}
                {!isQuick && step.note && (
                  <div className="mt-2 flex gap-2 items-start px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <Lightbulb size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-[11px] text-amber-200/70 leading-relaxed font-body italic">
                      {step.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Final Answer */}
      <div
        className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-2 sm:gap-3 flex-wrap ${
          isQuick
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-primary/40 bg-primary/8"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <CheckCircle2
            size={15}
            className={`flex-shrink-0 ${isQuick ? "text-amber-400" : "text-primary"}`}
          />
          <div className="min-w-0">
            <p
              className={`font-display text-[9px] tracking-[0.25em] mb-0.5 uppercase ${
                isQuick ? "text-amber-400/60" : "text-primary/60"
              }`}
            >
              {t.final_answer}
            </p>
            <p
              className={`font-mono text-base sm:text-xl font-bold break-all ${
                isQuick ? "text-amber-300" : "text-primary"
              }`}
              style={{
                textShadow: isQuick
                  ? "0 0 20px hsl(45 100% 60% / 0.5)"
                  : "0 0 20px hsl(120 100% 54% / 0.6)",
              }}
            >
              {finalAnswer}
            </p>
          </div>
        </div>
        <CopyButton text={finalAnswer} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TYPING INDICATOR
═══════════════════════════════════════════════════════════════ */
const TypingIndicator = ({ mode, t }: { mode: ResponseMode; t: Record<string, string> }) => (
  <div className="flex gap-3 sm:gap-4 items-start max-w-3xl mx-auto px-3 sm:px-6 py-3 animate-fade-in-up">
    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
      <Bot size={14} className="text-primary" />
    </div>
    <div className="flex items-center gap-1.5 sm:gap-2 pt-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${mode === "quick" ? "bg-amber-400/60" : "bg-primary/60"}`}
          style={{ animation: `pulse 1.4s ease-in-out ${delay}s infinite` }}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1 font-display tracking-wider">
        {mode === "quick" ? t.computing_fast : t.computing}
      </span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RENDER MARKDOWN-LIKE BOLD
═══════════════════════════════════════════════════════════════ */
const RenderContent = ({ content }: { content: string }) => {
  const parts = content.split("**");
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-primary font-semibold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
═══════════════════════════════════════════════════════════════ */
const MessageBubble = ({ msg, t }: { msg: Message; t: Record<string, string> }) => {
  const isUser = msg.role === "user";
  const time =
    msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);

  return (
    <div
      className={`group flex gap-2.5 sm:gap-4 max-w-3xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`hidden xs:flex flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border items-center justify-center self-start mt-1 ${
          isUser
            ? "bg-primary/20 border-primary/40"
            : "bg-primary/10 border-primary/30"
        }`}
      >
        {isUser ? (
          <UserIcon size={13} className="text-primary" />
        ) : (
          <Bot size={13} className="text-primary" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 ${isUser ? "flex flex-col items-end" : ""}`}
      >
        {/* Label + time + mode badge for AI */}
        <div
          className={`flex items-center gap-2 mb-1 sm:mb-1.5 flex-wrap ${isUser ? "flex-row-reverse" : ""}`}
        >
          <span className="font-display text-[10px] tracking-wider text-muted-foreground">
            {isUser ? t.you : t.logicia_ai}
          </span>
          <span className="text-[9px] text-muted-foreground/40 hidden sm:inline">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap overflow-hidden ${
            isUser
              ? "bg-primary/10 border border-primary/25 text-foreground rounded-tr-sm max-w-[90%] sm:max-w-[85%]"
              : "bg-muted/20 border border-border/50 text-foreground rounded-tl-sm w-full"
          }`}
        >
          <RenderContent content={msg.content} />
          {msg.solution && (
            <SolutionPanel
              steps={msg.solution.steps}
              finalAnswer={msg.solution.finalAnswer}
              method={msg.solution.method}
              graphData={msg.solution.graphData}
              mode={msg.solution.mode}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({ onPrompt, t, prompts }: { onPrompt: (p: string) => void; t: Record<string, string>; prompts: { label: string; prompt: string }[] }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 py-10 sm:py-16 text-center">
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-primary/30 bg-primary/5 flex items-center justify-center mb-4 sm:mb-5"
      style={{ boxShadow: "0 0 30px hsl(120 100% 54% / 0.15)" }}
    >
      <Bot size={24} className="text-primary sm:hidden" />
      <Bot size={28} className="text-primary hidden sm:block" />
    </div>
    <h2
      className="font-display text-lg sm:text-xl md:text-2xl font-bold text-primary mb-2 tracking-wider leading-tight"
      style={{ textShadow: "0 0 20px hsl(120 100% 54% / 0.5)" }}
    >
      {t.ask_anything}
    </h2>
    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm sm:max-w-md mb-6 sm:mb-8 leading-relaxed px-2">
      {t.ask_subtitle}
    </p>
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-xs xs:max-w-sm sm:max-w-md">
      {prompts.map((qp) => (
        <button
          key={qp.prompt}
          onClick={() => onPrompt(qp.prompt)}
          className="group text-left px-3 sm:px-4 py-3 rounded-xl border border-border/60 bg-muted/10 hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all duration-200 text-xs sm:text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center"
        >
          <Hash
            size={11}
            className="inline mr-2 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0"
          />
          <span className="truncate">{qp.label}</span>
        </button>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════════════════════════════ */
const loadConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Conversation[];
  } catch {
    /* ignore */
  }
  return [];
};

const saveConversations = (convs: Conversation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch {
    /* ignore */
  }
};

const makeId = () => Math.random().toString(36).slice(2);
const titleFromMessage = (text: string) =>
  text.slice(0, 40) + (text.length > 40 ? "…" : "");

/* ═══════════════════════════════════════════════════════════════
   MAIN CHAT PAGE
═══════════════════════════════════════════════════════════════ */
const Chat = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  /* Language — persisted */
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "te") return saved;
    } catch {
      /* ignore */
    }
    return "en";
  });

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch { /* ignore */ }
  }, []);

  const t = UI_STRINGS[language];
  const quickPrompts = QUICK_PROMPTS_I18N[language];

  /* Response mode — persisted */
  const [responseMode, setResponseMode] = useState<ResponseMode>(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "quick" || saved === "detailed") return saved;
    } catch {
      /* ignore */
    }
    return "detailed";
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("logicia_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch {
      /* ignore */
    }
    return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  });

  const isMobile = () =>
    typeof window !== "undefined" && window.innerWidth < 768;

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem("logicia_sidebar_open", sidebarOpen.toString());
    } catch {
      /* ignore */
    }
  }, [sidebarOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, responseMode);
    } catch {
      /* ignore */
    }
  }, [responseMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeConv?.messages, isTyping]);

  useEffect(() => {
    const ta = inputRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [input]);

  const newConversation = useCallback(() => {
    const conv: Conversation = {
      id: makeId(),
      title: t.new_conv_title,
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    if (isMobile()) setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [t.new_conv_title]);

  const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      let convId = activeId;
      if (!convId) {
        const conv: Conversation = {
          id: makeId(),
          title: titleFromMessage(trimmed),
          messages: [],
          createdAt: new Date(),
        };
        setConversations((prev) => [conv, ...prev]);
        convId = conv.id;
        setActiveId(conv.id);
      }

      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
        mode: responseMode,
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: [...c.messages, userMsg],
            title:
              c.messages.length === 0 ? titleFromMessage(trimmed) : c.title,
          };
        }),
      );
      setInput("");
      setIsTyping(true);

      try {
        const payload: {
          content: string;
          mode: ResponseMode;
          language: Language;
          conversation_id?: string;
        } = {
          content: trimmed,
          mode: responseMode,
          language: language,
        };
        // Only send conversation_id if the backend might recognise it (e.g. not a legacy local one)
        if (convId && convId.length > 20) {
          payload.conversation_id = convId;
        }

        const res = await fetch("http://localhost:8000/api/chat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // If backend 404s (e.g. legacy localStorage conversation not found in DB)
        if (res.status === 404 && payload.conversation_id) {
          delete payload.conversation_id;
          const retryRes = await fetch("http://localhost:8000/api/chat/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!retryRes.ok) throw new Error("Backend error after retry");
          const data = await retryRes.json();
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId ? { ...c, id: data.conversation_id, messages: [...c.messages, data.message] } : c,
            ),
          );
          setActiveId(data.conversation_id);
          setIsTyping(false);
          return;
        }

        if (!res.ok) throw new Error("Backend error");
        
        const data = await res.json();
        
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, id: data.conversation_id, messages: [...c.messages, data.message] } : c,
          ),
        );
        
        // If it was a new conversation, update activeId to the remote UUID
        if (!convId || convId !== data.conversation_id) {
          setActiveId(data.conversation_id);
        }

      } catch (error) {
        console.error("Failed to fetch from backend", error);
        // Fallback error message
        const errMsg: Message = {
          id: Date.now() + 1,
          role: "ai",
          content: t.error_backend,
          timestamp: new Date(),
          mode: responseMode,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c,
          ),
        );
      } finally {
        setIsTyping(false);
      }
    },
    [activeId, isTyping, responseMode, language, t.error_backend],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const charsLeft = MAX_CHARS - input.length;
  const isOverLimit = charsLeft < 0;
  const showCounter = input.length > MAX_CHARS * 0.7;

  /* ── RENDER ── */
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      {/* ════ SIDEBAR ════ */}
      <aside
        className={`
          flex flex-col flex-shrink-0 border-r border-border/50
          bg-background/95 backdrop-blur-xl z-50 
          transition-all duration-300 ease-in-out overflow-hidden
          fixed inset-y-0 left-0 md:relative md:inset-auto
          ${sidebarOpen ? "w-64 sm:w-72 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full w-64 sm:w-72 min-w-[16rem] sm:min-w-[18rem]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 sm:py-4 border-b border-border/50 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Logicia" className="w-6 h-6" />
              <span
                className="font-display text-sm tracking-wider text-primary"
                style={{ textShadow: "0 0 10px hsl(120 100% 54% / 0.5)" }}
              >
                LOGICIA
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/20 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <PanelLeftClose size={17} />
            </button>
          </div>

          {/* New chat */}
          <div className="p-3 flex-shrink-0">
            <button
              onClick={newConversation}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-primary/25 text-primary/80 hover:text-primary hover:bg-primary/8 hover:border-primary/50 active:scale-[0.98] transition-all duration-200 font-display text-[11px] sm:text-xs tracking-wider group min-h-[44px]"
            >
              <Plus
                size={15}
                className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0"
              />
              {t.new_conversation}
            </button>
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {conversations.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground/50 mt-8 px-4">
                {t.no_conversations}
              </p>
            ) : (
              <>
                <p className="font-display text-[9px] tracking-[0.25em] text-muted-foreground/40 px-3 py-2">
                  {t.history}
                </p>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id);
                      if (isMobile()) setSidebarOpen(false);
                    }}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer mb-0.5 transition-all duration-150 min-h-[44px] ${
                      activeId === conv.id
                        ? "bg-primary/8 text-foreground border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/20 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <span className="flex-1 text-xs truncate font-body">
                      {conv.title}
                    </span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground min-w-[28px] min-h-[28px] flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-4 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group min-h-[36px]"
            >
              <ArrowLeft
                size={13}
                className="group-hover:-translate-x-0.5 transition-transform flex-shrink-0"
              />
              {t.back_to_home}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════ MAIN AREA ════ */}
      <div className="relative flex flex-col flex-1 min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-3 sm:px-5 h-13 sm:h-14 border-b border-border/40 bg-background/70 backdrop-blur flex-shrink-0 z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Show sidebar"
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/20 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <PanelLeftOpen size={17} />
              </button>
            )}
            <span className="font-display text-[11px] sm:text-sm tracking-wider text-foreground/70 truncate">
              {activeConv ? activeConv.title : t.new_conv_title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {activeConv && activeConv.messages.length > 0 && (
              <button
                title="Clear current chat"
                onClick={() =>
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeId ? { ...c, messages: [] } : c,
                    ),
                  )
                }
                className="flex items-center gap-1.5 text-[10px] font-display tracking-wider text-muted-foreground hover:text-destructive border border-border/50 hover:border-destructive/40 rounded-lg px-2.5 sm:px-3 py-1.5 transition-all min-h-[34px]"
              >
                <Trash2 size={11} />
                <span className="hidden sm:inline">{t.clear}</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {(!activeConv || activeConv.messages.length === 0) && !isTyping ? (
            <EmptyState onPrompt={sendMessage} t={t} prompts={quickPrompts} />
          ) : (
            <div className="py-4 sm:py-6 pb-2">
              {activeConv?.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} t={t} />
              ))}
              {isTyping && <TypingIndicator mode={responseMode} t={t} />}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* Quick prompt chips */}
        {(!activeConv || activeConv.messages.length === 0) && (
          <div
            className="px-3 sm:px-6 pb-2 flex gap-2 overflow-x-auto flex-shrink-0"
            style={{ scrollbarWidth: "none" }}
          >
            {quickPrompts.slice(0, 3).map((qp) => (
              <button
                key={qp.prompt}
                onClick={() => sendMessage(qp.prompt)}
                disabled={isTyping}
                className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-display tracking-wider px-3 py-1.5 rounded-full border border-border/60 bg-muted/10 text-muted-foreground hover:text-primary hover:border-primary/30 active:scale-95 transition-all disabled:opacity-40 min-h-[34px]"
              >
                <Sparkles size={10} className="text-primary/60 flex-shrink-0" />
                <span className="whitespace-nowrap">{qp.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Input area ── */}
        <div className="flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur px-3 sm:px-6 py-3 sm:py-4">
          <div className="max-w-3xl mx-auto space-y-2">

            {/* ── MODE + LANGUAGE TOGGLES (sits just above the text field) ── */}
            <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
              <ModeToggle mode={responseMode} onChange={setResponseMode} t={t} />
              <LanguageToggle language={language} onChange={handleLanguageChange} />
            </div>

            {/* Text input row */}
            <div
              className={`flex gap-2 items-end rounded-xl sm:rounded-2xl border bg-muted/10 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 ${
                isOverLimit
                  ? "border-destructive/60"
                  : responseMode === "quick"
                    ? "border-amber-500/30 focus-within:border-amber-400/60 focus-within:shadow-[0_0_0_3px_hsl(45_100%_60%/0.08)]"
                    : "border-border/60 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(120_100%_54%/0.08)]"
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS + 20))}
                onKeyDown={handleKeyDown}
                placeholder={
                  responseMode === "quick"
                    ? t.placeholder_quick
                    : t.placeholder_detailed
                }
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground font-body leading-relaxed max-h-[120px] py-0.5"
              />
              <div className="flex items-center gap-2 flex-shrink-0 pb-0.5">
                {showCounter && (
                  <span
                    className={`text-[10px] font-mono tabular-nums ${isOverLimit ? "text-destructive" : "text-muted-foreground/50"}`}
                  >
                    {charsLeft}
                  </span>
                )}
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isTyping || !input.trim() || isOverLimit}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isTyping && !isOverLimit
                      ? responseMode === "quick"
                        ? "bg-amber-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_15px_hsl(45_100%_60%/0.4)]"
                        : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-[0_0_15px_hsl(120_100%_54%/0.4)]"
                      : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {responseMode === "quick" ? (
                    <Zap size={13} />
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </div>
            </div>

            {/* Hint text */}
            <p className="hidden sm:block text-[10px] text-muted-foreground/25 text-center font-body">
              {t.enter_to_send} <kbd className="font-mono">Enter</kbd> {t.to_send}{" "}
              <kbd className="font-mono">Shift+Enter</kbd> {t.new_line}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

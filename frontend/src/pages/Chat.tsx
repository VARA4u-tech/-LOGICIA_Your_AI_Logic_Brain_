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
import html2canvas from "html2canvas";
import { Share } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */

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
}
interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  solution?: SolutionData;
  timestamp: Date;
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
    ask_anything: "Ask me anything — Exams, GK, Math & More",
    ask_subtitle:
      "UPSC, SSC, Banking, Railways, GK, Reasoning, Science, Math — intelligent step-by-step answers.",
    placeholder_detailed:
      "Ask any competitive exam question (UPSC, SSC, GK, Math, Reasoning…)",
    placeholder_quick: "Ask for a quick answer (GK, shortcut, formula…)",
    enter_to_send: "Press",
    to_send: "to send ·",
    new_line: "for new line",
    computing: "Computing...",
    error_backend:
      "Sorry, I am having trouble connecting to the Logicia server right now. Please make sure the backend is running on :8000.",
    logicia_ai: "LOGICIA AI",
    you: "YOU",
    final_answer: "Final Answer",
    hide: "HIDE",
    show_steps: "SHOW STEPS",
    visualization: "VISUALIZATION",
    new_conv_title: "New Conversation",
  },
  te: {
    new_conversation: "కొత్త సంభాషణ",
    no_conversations: "ఇంకా సంభాషణలు లేవు. ఒకటి ప్రారంభించండి!",
    history: "చరిత్ర",
    back_to_home: "హోమ్‌కి తిరిగి వెళ్ళు",
    clear: "క్లియర్",
    ask_anything: "ఏదైనా అడగండి — పరీక్షలు, GK, గణితం & మరిన్ని",
    ask_subtitle:
      "UPSC, SSC, Banking, Railways, GK, Reasoning, Science, గణితం — తెలివైన దశలవారీ సమాధానాలు.",
    placeholder_detailed:
      "ఏదైనా పోటీ పరీక్ష ప్రశ్న అడగండి (UPSC, SSC, GK, గణితం, Reasoning…)",
    placeholder_quick: "శీఘ్ర సమాధానం కోసం అడగండి (GK, shortcut, formula…)",
    enter_to_send: "పంపడానికి",
    to_send: "నొక్కండి ·",
    new_line: "కొత్త పంక్తి కోసం",
    computing: "గణన జరుగుతోంది...",
    error_backend:
      "క్షమించండి, లాజిషియా సర్వర్‌కు కనెక్ట్ అవడంలో సమస్య ఉంది. దయచేసి బ్యాకెండ్ :8000 పోర్ట్‌లో నడుస్తుందో లేదో తనిఖీ చేయండి.",
    logicia_ai: "లాజిషియా AI",
    you: "మీరు",
    final_answer: "తుది సమాధానం",
    hide: "దాచు",
    show_steps: "దశలు చూపించు",
    visualization: "విజువలైజేషన్",
    new_conv_title: "కొత్త సంభాషణ",
  },
};

const QUICK_PROMPTS_I18N: Record<
  Language,
  { label: string; prompt: string }[]
> = {
  en: [
    {
      label: "🏛️ Who is PM of India?",
      prompt:
        "Who is the current Prime Minister of India? Give full background.",
    },
    {
      label: "📜 Article 370 what?",
      prompt: "What is Article 370? Why was it removed? Explain for UPSC.",
    },
    {
      label: "💰 Profit & Loss shortcut",
      prompt:
        "Explain profit and loss percentage shortcut trick for SSC CGL with example.",
    },
    {
      label: "🧠 Blood relation puzzle",
      prompt:
        "A is B's brother. B is C's mother. How is A related to C? Reasoning step by step.",
    },
    {
      label: "🚆 RRB GK question",
      prompt:
        "Which is the longest railway platform in India? Give related railway GK facts.",
    },
    {
      label: "🏦 Bank interest trick",
      prompt:
        "Simple vs Compound Interest difference with formula and shortcut trick for banking exams.",
    },
    {
      label: "🧪 Science question",
      prompt:
        "What is Ohm's Law? Explain with formula and real-life example for SSC/Railways.",
    },
    { label: "📐 Solve x² − 5x + 6", prompt: "solve quadratic x^2 - 5x + 6" },
  ],
  te: [
    {
      label: "🏛️ భారత PM ఎవరు?",
      prompt: "భారత ప్రస్తుత ప్రధానమంత్రి ఎవరు? పూర్తి వివరాలు చెప్పండి.",
    },
    {
      label: "📜 Article 370 అంటే?",
      prompt:
        "Article 370 అంటే ఏమిటి? ఎందుకు రద్దు చేశారు? UPSC కోసం వివరించండి.",
    },
    {
      label: "💰 లాభ నష్టం ట్రిక్",
      prompt: "SSC CGL కోసం లాభ నష్టం శాతం shortcut trick ఉదాహరణతో వివరించండి.",
    },
    {
      label: "🧠 Blood Relation puzzle",
      prompt:
        "A అనేది B యొక్క సోదరుడు. B అనేది C యొక్క తల్లి. A మరియు C మధ్య సంబంధం ఏమిటి?",
    },
    {
      label: "🚆 RRB GK ప్రశ్న",
      prompt:
        "భారతదేశంలో అతి పొడవైన రైల్వే ప్లాట్‌ఫారమ్ ఏది? రైల్వే GK facts చెప్పండి.",
    },
    {
      label: "🏦 వడ్డీ ట్రిక్",
      prompt:
        "Simple vs Compound Interest తేడా, formula, banking exams కోసం shortcut trick వివరించండి.",
    },
    {
      label: "🧪 Science ప్రశ్న",
      prompt: "Ohm's Law అంటే ఏమిటి? SSC/Railways కోసం formula తో వివరించండి.",
    },
    {
      label: "📐 x² − 5x + 6 సాధించండి",
      prompt: "solve quadratic x^2 - 5x + 6",
    },
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
  <div className="flex items-center gap-3 my-2 min-w-0 group/math">
    <div className="font-mono text-sm sm:text-base px-4 py-2 rounded-xl bg-black/40 border border-primary/20 text-primary inline-block overflow-x-auto max-w-full whitespace-nowrap shadow-lg group-hover/math:border-primary/40 transition-all duration-300">
      {expr}
    </div>
    <CopyButton text={expr} />
  </div>
);

const SectionHeader = ({ text }: { text: string }) => {
  const isGiven = /given|ఇవ్వబడింది/i.test(text);
  const isCalculation = /calculation|గణన/i.test(text);
  const isConclusion = /∴|conclusion|నిర్ణయం/i.test(text);
  const isShortcut = /💡|shortcut|షార్ట్/i.test(text);

  let icon = <Hash size={12} />;
  let styles = "text-primary border-primary/30 bg-primary/5";

  if (isGiven) {
    icon = <BookOpen size={12} />;
    styles =
      "text-sky-400 border-sky-500/30 bg-sky-500/5 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
  } else if (isCalculation) {
    icon = <Zap size={12} />;
    styles = "text-primary border-primary/30 bg-primary/5";
  } else if (isConclusion) {
    icon = <CheckCircle2 size={12} />;
    styles =
      "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
  } else if (isShortcut) {
    icon = <Sparkles size={12} />;
    styles =
      "text-amber-400 border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
  }

  const cleanText = text.replace(/\*\*/g, "").replace(/:$/, "").trim();

  return (
    <div
      className={`flex items-center gap-2 font-display text-[10px] sm:text-[11px] tracking-[0.2em] uppercase px-3 py-2 rounded-lg border ${styles} mt-4 mb-2 transition-all group w-fit`}
    >
      <span className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
        {icon}
      </span>
      <span>{cleanText}</span>
    </div>
  );
};

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
  <div className="flex items-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-muted/10 border border-border/40 backdrop-blur-sm shadow-inner">
    <button
      onClick={() => onChange("en")}
      className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-display tracking-[0.1em] sm:tracking-widest transition-all duration-500 min-h-[28px] sm:min-h-[32px] flex items-center justify-center ${
        language === "en"
          ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10 font-bold"
          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/10"
      }`}
    >
      <span className="hidden xs:inline">ENGLISH</span>
      <span className="xs:hidden">EN</span>
    </button>
    <button
      onClick={() => onChange("te")}
      className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-display tracking-[0.1em] sm:tracking-widest transition-all duration-500 min-h-[28px] sm:min-h-[32px] flex items-center justify-center ${
        language === "te"
          ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/10 font-bold"
          : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/10"
      }`}
    >
      <span className="hidden xs:inline">తెలుగు</span>
      <span className="xs:hidden">TE</span>
    </button>
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
  t,
  content,
}: {
  steps: Step[];
  finalAnswer: string;
  method?: string;
  graphData?: PlotData[];
  t: Record<string, string>;
  content?: string;
}) => {
  const [expanded, setExpanded] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!panelRef.current) return;
    setIsExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const canvas = await html2canvas(panelRef.current, {
        backgroundColor: "#050505",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `Logicia-Solution-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="mt-6 space-y-6 border-t border-border/10 pt-6 animate-in fade-in duration-700"
      ref={panelRef}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {method && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Lightbulb size={12} className="text-primary animate-pulse" />
              <span className="tracking-widest uppercase font-display text-[10px] text-primary font-bold">
                {method}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isExporting && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="group flex items-center gap-2 text-[10px] font-display tracking-widest text-muted-foreground hover:text-primary transition-all bg-muted/10 hover:bg-primary/5 border border-border/40 rounded-xl px-4 py-2"
            >
              <Share
                size={12}
                className={
                  isExporting
                    ? "animate-spin"
                    : "group-hover:scale-110 transition-transform"
                }
              />
              <span>{isExporting ? "EXPORTING..." : "SHARE SOLUTION"}</span>
            </button>
          )}

          {!isExporting && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-2 text-[10px] font-display tracking-widest text-primary/70 hover:text-primary transition-all border border-primary/20 hover:border-primary/40 rounded-xl px-4 py-2"
            >
              {expanded ? (
                <>
                  <span>COLLAPSE</span>
                  <ChevronUp size={12} />
                </>
              ) : (
                <>
                  <span>EXPAND STEPS</span>
                  <ChevronDown size={12} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Graph */}
      {graphData && graphData.length > 0 && (
        <div className="rounded-3xl overflow-hidden border border-primary/10 bg-black/40 shadow-2xl backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/5">
            <div className="flex items-center gap-3 text-[10px] text-primary/60 font-display tracking-[0.3em] uppercase">
              <BarChart2 size={14} className="text-primary" /> Visual
              Intelligence
            </div>
          </div>
          <div className="h-[200px] sm:h-[300px] p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(120 100% 54% / 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="x"
                  stroke="hsl(120 20% 30%)"
                  fontSize={10}
                  tickFormatter={(v) => v.toFixed(1)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(120 20% 30%)"
                  fontSize={10}
                  tickFormatter={(v) => v.toFixed(1)}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(5, 5, 5, 0.9)",
                    borderColor: "rgba(18, 255, 18, 0.2)",
                    borderRadius: "16px",
                    fontSize: "12px",
                    backdropFilter: "blur(8px)",
                  }}
                  itemStyle={{ color: "#12ff12" }}
                  cursor={{ stroke: "rgba(18, 255, 18, 0.2)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#12ff12"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#12ff12",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Steps */}
      <div
        className="overflow-hidden transition-all duration-700 ease-in-out"
        style={{
          maxHeight: expanded ? `${steps.length * 400 + 500}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="space-y-6 py-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 sm:gap-6 items-start group/step">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-primary/20 bg-primary/5 text-primary flex items-center justify-center text-[10px] font-display font-black transition-all group-hover/step:border-primary/60 group-hover/step:scale-110">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <p className="text-[10px] tracking-[0.2em] uppercase font-display text-primary/40 font-bold group-hover/step:text-primary/70 transition-colors">
                  {step.label}
                </p>

                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-primary/10 group-hover/step:border-primary/30 transition-all duration-500 shadow-xl overflow-x-auto">
                  <code className="text-primary font-mono text-base sm:text-lg">
                    {step.math}
                  </code>
                </div>

                {step.explanation && (
                  <p className="text-[13px] sm:text-[14px] text-muted-foreground/80 leading-relaxed font-body pl-2 border-l-2 border-primary/10 group-hover/step:border-primary/40 transition-all">
                    {step.explanation}
                  </p>
                )}

                {step.note && (
                  <div className="flex gap-3 items-start px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm">
                    <Lightbulb
                      size={14}
                      className="text-amber-400 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-xs sm:text-[13px] text-amber-200/60 leading-relaxed italic font-body">
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
      <div className="relative group overflow-hidden rounded-[2rem] p-0.5 bg-gradient-to-br from-primary/40 via-primary/10 to-transparent shadow-2xl">
        <div className="bg-[#0a0a0a] rounded-[1.95rem] p-6 sm:p-8 flex items-center justify-between gap-6 flex-wrap relative z-10">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <CheckCircle2 size={24} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[11px] tracking-[0.4em] mb-2 uppercase text-primary/40 font-black">
                {t.final_answer}
              </p>
              <p className="font-mono text-2xl sm:text-3xl lg:text-4xl font-black text-primary drop-shadow-[0_0_12px_rgba(18,255,18,0.3)] truncate">
                {finalAnswer}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(finalAnswer)}
            className="w-12 h-12 rounded-2xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300"
          >
            <Copy size={18} />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TYPING INDICATOR
═══════════════════════════════════════════════════════════════ */
const TypingIndicator = ({ t }: { t: Record<string, string> }) => (
  <div className="flex gap-4 sm:gap-6 items-start max-w-4xl mx-auto px-4 sm:px-6">
    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
      <Bot size={18} className="text-primary animate-bounce" />
    </div>
    <div className="flex-1 space-y-3 pt-1">
      <div className="flex items-center gap-3">
        <span className="font-display text-[11px] sm:text-xs tracking-widest uppercase text-primary/60 font-bold">
          {t.logicia_ai}
        </span>
        <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest">
          {t.computing}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {[0, 0.15, 0.3].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            style={{ animation: `pulse 1.4s ease-in-out ${delay}s infinite` }}
          />
        ))}
        <div className="h-4 w-48 bg-primary/5 border border-primary/10 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RICH CONTENT RENDERER
   Handles: **bold**, section headers, bullet lists, math blocks,
   markdown tables, symbols, and inline LaTeX
═══════════════════════════════════════════════════════════════ */

const TableRenderer = ({ markdown }: { markdown: string }) => {
  const rows = markdown.split("\n").filter((r) => r.includes("|"));
  if (rows.length < 2) return null;

  const parseRow = (row: string) =>
    row
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const head = parseRow(rows[0]);
  const body = rows.slice(2).map(parseRow); // Skip header and separator row

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-primary/20 bg-black/40">
      <table className="w-full text-[10px] sm:text-xs">
        <thead className="bg-primary/10 border-b border-primary/20">
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-display uppercase tracking-widest text-primary/70"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {body.map((row, i) => (
            <tr key={i} className="hover:bg-primary/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 font-body text-foreground/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RenderContent = ({ content }: { content: string }) => {
  // Normalize newline formatting for tables and lists, and cleanup LaTeX environments
  const normalizedContent = content
    .replace(/\\begin\{aligned\}/g, "\\[")
    .replace(/\\end\{aligned\}/g, "\\]")
    .replace(/\\\( /g, "\\(")
    .replace(/ \\\)/g, "\\)")
    .replace(/\\\[ /g, "\\[")
    .replace(/ \\\]/g, "\\]")
    // Ensure tables have spacing
    .replace(/\n(\|.*\|)\n/g, "\n\n$1\n\n")
    // Safety net: Clean naked LaTeX commands if not wrapped in math blocks
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, "($1/$2)")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\equiv/g, "≡")
    .replace(/\\%/g, "%")
    .replace(/\\text\{(.+?)\}/g, " $1 ");

  const paragraphs = normalizedContent.split(/\n{2,}/);

  return (
    <div className="space-y-5">
      {paragraphs.map((para, pIdx) => {
        const trimmedPara = para.trim();
        if (!trimmedPara) return null;

        // --- TABLE DETECTION: lines starting/ending with |
        if (
          trimmedPara.includes("|") &&
          trimmedPara.split("\n").some((l) => l.includes("|---"))
        ) {
          return <TableRenderer key={pIdx} markdown={trimmedPara} />;
        }

        // --- SECTION HEADER DETECTION
        const isHeaderOnly =
          trimmedPara.split("\n").length === 1 &&
          (/^(Given|Calculation|Conclusion|Shortcut|నిర్ణయం|గణన|ఇవ్వబడింది|షార్ట్|💡|∴)/i.test(
            trimmedPara,
          ) ||
            trimmedPara.match(/^\*\*(.+?)\*\*:?\s*$/));

        if (isHeaderOnly) {
          return <SectionHeader key={pIdx} text={trimmedPara} />;
        }

        // Check if paragraph *starts* with a header followed by content
        const lines = trimmedPara.split("\n");
        const firstLine = lines[0];
        const isInlineHeader =
          /^(Given|Calculation|Conclusion|Shortcut|నిర్ణయం|గణన|ఇవ్వబడింది|షార్ట్|💡|∴)/i.test(
            firstLine,
          ) && firstLine.includes(":");

        const contentLines = isInlineHeader ? lines.slice(1) : lines;

        return (
          <div key={pIdx} className="space-y-3">
            {isInlineHeader && <SectionHeader text={firstLine} />}
            <div
              className={`space-y-2.5 ${isInlineHeader ? "pl-1 sm:pl-2" : ""}`}
            >
              {contentLines.map((line, lIdx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                // Bullet / list item: handles -, •, ▸, *, or numeric like 1.
                if (/^([-•▸*]|\d+\.)\s/.test(trimmedLine)) {
                  const bulletContent = trimmedLine.replace(
                    /^([-•▸*]|\d+\.)\s*/,
                    "",
                  );
                  const isStepHeader = /^Step \d+/i.test(bulletContent);

                  return (
                    <div
                      key={lIdx}
                      className={`flex gap-3 items-start ${isStepHeader ? "mt-4 first:mt-0" : ""}`}
                    >
                      <div
                        className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center ${isStepHeader ? "mt-2" : ""}`}
                      >
                        <div className="w-0.5 h-0.5 rounded-full bg-primary" />
                      </div>
                      <span
                        className={`flex-1 ${isStepHeader ? "font-display text-primary tracking-wide text-[11px] sm:text-xs font-bold border-b border-primary/10 pb-1 flex justify-between items-center" : "text-foreground/85"}`}
                      >
                        <InlineRenderer text={bulletContent} />
                      </span>
                    </div>
                  );
                }

                // Math display block: \[...\] or $$...$$
                if (
                  /^(\\\[|\$\$)/.test(trimmedLine) ||
                  /(\\\]|\$\$)$/.test(trimmedLine)
                ) {
                  const mathContent = trimmedLine
                    .replace(/^(\\\[|\$\$)\s*/, "")
                    .replace(/\s*(\\\]|\$\$)$/, "")
                    .trim();

                  if (mathContent) {
                    return (
                      <div
                        key={lIdx}
                        className="font-mono text-xs sm:text-sm px-5 py-4 rounded-2xl bg-black/60 border border-primary/20 text-primary my-3 overflow-x-auto shadow-2xl relative group"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={mathContent} />
                        </div>
                        <code className="whitespace-pre-wrap leading-relaxed block pr-8">
                          {mathContent.split(/\s*\\\\s*/).map((mLine, mi) => (
                            <div key={mi} className="min-h-[1.5em]">
                              {mLine.trim()}
                            </div>
                          ))}
                        </code>
                      </div>
                    );
                  }
                  return null;
                }

                // Regular line
                const isConclusionArrow =
                  trimmedLine.startsWith("⇒") || trimmedLine.startsWith("∴");
                return (
                  <p
                    key={lIdx}
                    className={`text-[13px] sm:text-[15px] leading-relaxed font-body ${isConclusionArrow ? "text-primary/95 font-medium pl-3 border-l-2 border-primary/20 py-1 bg-primary/5 rounded-r-lg" : "text-foreground/80"}`}
                  >
                    <InlineRenderer text={trimmedLine} />
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Inline renderer for bold, inline math ($...$ or \(...\)), and symbols */
const InlineRenderer = ({ text }: { text: string }) => {
  const tokens: {
    type: "text" | "bold" | "math" | "highlight";
    value: string;
  }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Patterns with capturing groups for the content inside
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    const mathMatch1 = remaining.match(/^(.*?)\\\((.+?)\\\)(.*)/s);
    const mathMatch2 = remaining.match(/^(.*?)\$(.+?)\$(.*)/s);

    const matches = [
      {
        result: boldMatch,
        type: "bold" as const,
        index: boldMatch ? boldMatch[1].length : Infinity,
      },
      {
        result: mathMatch1,
        type: "math" as const,
        index: mathMatch1 ? mathMatch1[1].length : Infinity,
      },
      {
        result: mathMatch2,
        type: "math" as const,
        index: mathMatch2 ? mathMatch2[1].length : Infinity,
      },
    ].sort((a, b) => a.index - b.index);

    const earliest = matches[0];

    if (earliest.index === Infinity) {
      tokens.push({ type: "text", value: remaining });
      break;
    }

    if (earliest.result![1]) {
      tokens.push({ type: "text", value: earliest.result![1] });
    }
    tokens.push({ type: earliest.type, value: earliest.result![2] });
    remaining = earliest.result![3];
  }

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === "bold") {
          return (
            <strong key={i} className="text-primary font-bold">
              {token.value}
            </strong>
          );
        }
        if (token.type === "math") {
          // Clean common math commands for cleaner inline display
          const cleanMath = token.value
            .replace(/\\equiv/g, " ≡ ")
            .replace(/\\pmod\{(.+?)\}/g, " (mod $1)")
            .replace(/\\pmod/g, " mod ")
            .replace(/\\times/g, " × ")
            .replace(/\\cdot/g, " · ")
            .replace(/\\div/g, " ÷ ")
            .replace(/\\implies/g, " ⇒ ")
            .replace(/\\therefore/g, " ∴ ")
            .replace(/\\text\{(.+?)\}/g, " $1 ")
            .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, "($1/$2)")
            .replace(/\\left\(/g, "(")
            .replace(/\\right\)/g, ")")
            .replace(/\\left\[/g, "[")
            .replace(/\\right\]/g, "]")
            .replace(/\\%/g, "%")
            .replace(/\\quad/g, "   ")
            .replace(/\\rightarrow/g, " → ")
            .replace(/\\Rightarrow/g, " ⇒ ")
            .replace(/\\&/g, "&")
            .replace(/\\;/g, " ")
            .replace(/\\,/g, " ")
            .replace(/\\dots/g, "...")
            .replace(/\\ldots/g, "...")
            .replace(/\\begin\{array\}\{.*?\}/g, "")
            .replace(/\\end\{array\}/g, "")
            .replace(/\\hline/g, "")
            .replace(/\\begin\{aligned\}/g, "")
            .replace(/\\end\{aligned\}/g, "")
            .replace(/&/g, "")
            .replace(/\\\\/g, "\n")
            .replace(/\\\{/g, "{")
            .replace(/\\\}/g, "}");

          return (
            <code
              key={i}
              className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-md text-[11px] sm:text-xs border border-primary/20 mx-0.5"
            >
              {cleanMath}
            </code>
          );
        }
        return (
          <span key={i}>
            {token.value.split(/(⇒|∴|iff)/).map((seg, j) => {
              if (seg === "⇒")
                return (
                  <span key={j} className="text-primary font-bold mx-1">
                    ⇒
                  </span>
                );
              if (seg === "∴")
                return (
                  <span
                    key={j}
                    className="text-emerald-400 font-bold mr-1 mx-1"
                  >
                    ∴
                  </span>
                );
              if (seg === "iff")
                return (
                  <span key={j} className="italic text-primary/80 mx-1">
                    if and only if
                  </span>
                );
              return seg;
            })}
          </span>
        );
      })}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
═══════════════════════════════════════════════════════════════ */
const MessageBubble = ({
  msg,
  t,
}: {
  msg: Message;
  t: Record<string, string>;
}) => {
  const isUser = msg.role === "user";
  const time =
    msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);

  return (
    <div
      className={`group w-full py-6 sm:py-8 border-b border-border/10 transition-colors duration-300 ${
        isUser ? "bg-transparent" : "bg-muted/5 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-4 sm:gap-6">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center self-start mt-1 shadow-lg transition-transform group-hover:scale-105 duration-300 ${
            isUser
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-muted/20 border-border/50 text-primary"
          }`}
        >
          {isUser ? (
            <UserIcon size={16} />
          ) : (
            <Bot size={18} className="animate-pulse" />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-[11px] sm:text-xs tracking-wider uppercase text-foreground/80 font-bold">
              {isUser ? t.you : t.logicia_ai}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="text-[14px] sm:text-[16px] leading-relaxed text-foreground/90 font-body">
            {isUser ? (
              <span className="whitespace-pre-wrap">{msg.content}</span>
            ) : (
              <RenderContent content={msg.content} />
            )}
            {msg.solution && (
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SolutionPanel
                  steps={msg.solution.steps}
                  finalAnswer={msg.solution.finalAnswer}
                  method={msg.solution.method}
                  graphData={msg.solution.graphData}
                  content={msg.content}
                  t={t}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
const EmptyState = ({
  onPrompt,
  t,
  prompts,
}: {
  onPrompt: (p: string) => void;
  t: Record<string, string>;
  prompts: { label: string; prompt: string }[];
}) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-20 text-center animate-in fade-in duration-700">
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] border-2 border-primary/30 bg-primary/5 flex items-center justify-center mb-8 relative group">
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
      <Bot
        size={40}
        className="text-primary relative z-10 transition-transform group-hover:scale-110 duration-500"
      />
    </div>

    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/40 mb-4 tracking-tighter leading-tight">
      {t.ask_anything}
    </h2>

    <p className="text-sm sm:text-base text-muted-foreground/60 max-w-lg mb-12 leading-relaxed font-body">
      {t.ask_subtitle}
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {prompts.map((qp) => (
        <button
          key={qp.prompt}
          onClick={() => onPrompt(qp.prompt)}
          className="group relative flex flex-col items-start p-5 rounded-2xl border border-border/40 bg-muted/5 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles size={14} className="text-primary/40" />
          </div>
          <span className="text-[12px] font-display tracking-widest text-primary/40 group-hover:text-primary transition-colors mb-2 uppercase">
            Example Query
          </span>
          <span className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors font-body">
            {qp.label}
          </span>
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

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, []);

  const t = UI_STRINGS[language];
  const quickPrompts = QUICK_PROMPTS_I18N[language];

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
      if (!trimmed || isTyping || cooldown > 0) return;

      setCooldown(5);

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
          language: Language;
          conversation_id?: string;
        } = {
          content: trimmed,
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
              c.id === convId
                ? {
                    ...c,
                    id: data.conversation_id,
                    messages: [...c.messages, data.message],
                  }
                : c,
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
            c.id === convId
              ? {
                  ...c,
                  id: data.conversation_id,
                  messages: [...c.messages, data.message],
                }
              : c,
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
    [activeId, isTyping, language, t.error_backend, cooldown],
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
          flex flex-col flex-shrink-0 border-r border-border/10
          bg-[#050505] z-50 
          transition-all duration-500 ease-in-out overflow-hidden
          fixed inset-y-0 left-0 md:relative md:inset-auto
          ${sidebarOpen ? "w-72 sm:w-80 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full w-72 sm:w-80 min-w-[18rem] sm:min-w-[20rem]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border/5 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:neon-box transition-all duration-500">
                <img src="/logo.png" alt="Logicia" className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm tracking-[0.2em] text-primary font-black uppercase">
                  LOGICIA
                </span>
                <span className="text-[10px] text-muted-foreground/40 uppercase tracking-tighter">
                  Neural Network v2
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-muted-foreground hover:text-primary rounded-xl transition-all duration-300"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* New chat */}
          <div className="p-4 flex-shrink-0">
            <button
              onClick={newConversation}
              className="w-full h-12 flex items-center gap-3 px-5 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 font-display text-[11px] tracking-widest uppercase font-bold active:scale-95 shadow-lg shadow-primary/5"
            >
              <Plus size={16} />
              {t.new_conversation}
            </button>
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <Hash size={24} className="text-muted-foreground mb-3" />
                <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground px-4">
                  {t.no_conversations}
                </p>
              </div>
            ) : (
              <>
                <p className="font-display text-[9px] tracking-[0.3em] text-muted-foreground/30 px-3 py-4 uppercase">
                  Brain History
                </p>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id);
                      if (isMobile()) setSidebarOpen(false);
                    }}
                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      activeId === conv.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeId === conv.id ? "bg-primary scale-110 shadow-[0_0_8px_primary]" : "bg-muted scale-75 group-hover:bg-primary/40"}`}
                    />
                    <span className="flex-1 text-[13px] truncate font-body">
                      {conv.title}
                    </span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all duration-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/5 p-6 space-y-4 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-3 text-[11px] font-display tracking-widest uppercase text-muted-foreground hover:text-primary transition-all duration-300 group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
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
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 border-b border-border/20 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Show sidebar"
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-display text-[10px] xs:text-[12px] sm:text-[13px] tracking-wide xs:tracking-widest text-primary/90 font-bold truncate">
                {activeConv ? activeConv.title : t.new_conv_title}
              </span>
              <span className="text-[9px] xs:text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                Logicia Intelligence v2.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageToggle
              language={language}
              onChange={handleLanguageChange}
            />
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
                className="flex items-center gap-2 text-[10px] font-display tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/50 hover:border-destructive/40 rounded-xl px-3 py-2 transition-all duration-300"
              >
                <Trash2 size={13} />
                <span className="hidden md:inline">{t.clear}</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {(!activeConv || activeConv.messages.length === 0) && !isTyping ? (
            <EmptyState onPrompt={sendMessage} t={t} prompts={quickPrompts} />
          ) : (
            <div className="w-full">
              {activeConv?.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} t={t} />
              ))}
              {isTyping && (
                <div className="py-8 bg-muted/5 backdrop-blur-sm border-b border-border/10">
                  <TypingIndicator t={t} />
                </div>
              )}
              <div ref={bottomRef} className="h-32" />
            </div>
          )}
        </main>

        {/* ── Input and Quick Prompts Container ── */}
        <div className="flex-shrink-0 border-t border-border/10 bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-4 sm:pb-8 px-4 z-20">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Quick prompt chips - Now inside the managed space */}
            {(!activeConv || activeConv.messages.length === 0) && (
              <div
                className="flex gap-2 overflow-x-auto no-scrollbar pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {quickPrompts.slice(0, 4).map((qp) => (
                  <button
                    key={qp.prompt}
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={isTyping}
                    className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-display tracking-wider px-4 py-2 rounded-xl border border-border/40 bg-muted/10 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Sparkles
                      size={11}
                      className="text-primary/70 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap">{qp.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="relative">
              {/* Input Container */}
              <div
                className={`relative group bg-muted/20 backdrop-blur-xl border-2 rounded-2xl sm:rounded-[2rem] transition-all duration-500 overflow-hidden shadow-2xl ${
                  isOverLimit
                    ? "border-destructive/50"
                    : "border-border/40 focus-within:border-primary/40 focus-within:shadow-[0_0_40px_-10px_hsl(120_100%_54%/0.15)] group-hover:border-border/60"
                }`}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value.slice(0, MAX_CHARS + 20))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder_detailed}
                  rows={1}
                  className="w-full bg-transparent outline-none resize-none text-[15px] text-foreground placeholder:text-muted-foreground font-body leading-relaxed max-h-[200px] py-4 sm:py-5 pl-5 sm:pl-7 pr-16 sm:pr-20 block custom-scrollbar transition-all"
                />

                <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-4 flex items-center gap-3">
                  {showCounter && (
                    <span
                      className={`text-[10px] font-mono tabular-nums font-bold ${isOverLimit ? "text-destructive" : "text-primary/40"}`}
                    >
                      {charsLeft}
                    </span>
                  )}

                  <button
                    onClick={() => sendMessage(input)}
                    disabled={
                      isTyping || !input.trim() || isOverLimit || cooldown > 0
                    }
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-lg ${
                      input.trim() &&
                      !isTyping &&
                      !isOverLimit &&
                      cooldown === 0
                        ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95 neon-box shadow-primary/20"
                        : "bg-muted/40 text-muted-foreground/30 cursor-not-allowed scale-95"
                    }`}
                  >
                    {cooldown > 0 ? (
                      <span className="text-[11px] font-bold font-mono text-primary/60">
                        {cooldown}s
                      </span>
                    ) : (
                      <Send
                        size={18}
                        className={
                          input.trim() ? "animate-in zoom-in duration-300" : ""
                        }
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Hint text */}
              <div className="mt-3 flex justify-center gap-4 text-[10px] text-muted-foreground/30 font-display tracking-widest uppercase">
                <span className="hidden sm:inline">
                  Press{" "}
                  <kbd className="font-mono text-primary/40 border border-primary/20 px-1.5 rounded bg-primary/5">
                    Enter
                  </kbd>{" "}
                  to send
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">
                  <kbd className="font-mono text-primary/40 border border-primary/20 px-1.5 rounded bg-primary/5">
                    Shift + Enter
                  </kbd>{" "}
                  for new line
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

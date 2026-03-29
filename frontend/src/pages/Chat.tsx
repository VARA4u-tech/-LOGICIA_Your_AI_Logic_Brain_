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
    ask_anything: "Ask me anything math",
    ask_subtitle:
      "Solve equations, derivatives, integrals, and more — step by step.",
    placeholder_detailed: "Ask a math question…",
    placeholder_quick: "Ask for a quick answer…",
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
    ask_anything: "ఏదైనా గణితం అడగండి",
    ask_subtitle:
      "సమీకరణాలు, డెరివేటివ్‌లు, ఇంటిగ్రల్‌లు మరియు మరిన్నింటిని దశలవారీగా పరిష్కరించండి.",
    placeholder_detailed: "ఒక గణిత ప్రశ్న అడగండి…",
    placeholder_quick: "శీఘ్ర సమాధానం కోసం అడగండి…",
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

const SectionHeader = ({ text }: { text: string }) => {
  const isGiven = /given|ఇవ్వబడింది/i.test(text);
  const isCalculation = /calculation|గణన/i.test(text);
  const isConclusion = /∴|conclusion|నిర్ణయం/i.test(text);
  const isShortcut = /💡|shortcut|షార్ట్/i.test(text);

  let icon = <Hash size={12} />;
  let styles = "text-primary border-primary/30 bg-primary/5";
  
  if (isGiven) {
    icon = <BookOpen size={12} />;
    styles = "text-sky-400 border-sky-500/30 bg-sky-500/5 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
  } else if (isCalculation) {
    icon = <Zap size={12} />;
    styles = "text-primary border-primary/30 bg-primary/5";
  } else if (isConclusion) {
    icon = <CheckCircle2 size={12} />;
    styles = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
  } else if (isShortcut) {
    icon = <Sparkles size={12} />;
    styles = "text-amber-400 border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
  }

  const cleanText = text.replace(/\*\*/g, "").replace(/:$/, "").trim();

  return (
    <div className={`flex items-center gap-2 font-display text-[10px] sm:text-[11px] tracking-[0.2em] uppercase px-3 py-2 rounded-lg border ${styles} mt-4 mb-2 transition-all group w-fit`}>
      <span className="group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">{icon}</span>
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
      // Small delay to ensure any transient animations settle
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(panelRef.current, {
        backgroundColor: "#050505",
        scale: 2, // High quality
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
      className="mt-3 sm:mt-4 space-y-3 border-t border-border/40 pt-3 sm:pt-4"
      ref={panelRef}
    >
      {/* Invisible header for export branding */}
      {isExporting && (
        <div className="flex items-center gap-3 mb-6 px-2">
          <img src="/logo.png" alt="Logicia" className="w-8 h-8" />
          <div>
            <h3 className="text-primary font-display tracking-widest text-lg">
              LOGICIA AI
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
              Your AI Math Brain
            </p>
          </div>
        </div>
      )}

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
        </div>

        <div className="flex items-center gap-2">
          {!isExporting && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-[10px] font-display tracking-widest text-muted-foreground hover:text-primary transition-all bg-muted/10 hover:bg-primary/5 border border-border/50 rounded-md px-2.5 py-1 min-h-[30px]"
              title="Share solution as image"
            >
              <Share size={11} className={isExporting ? "animate-pulse" : ""} />
              <span>{isExporting ? "PREPARING..." : "SHARE"}</span>
            </button>
          )}

          {!isExporting && (
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
      </div>

      {/* Export context: if exporting, include the main content too */}
      {isExporting && content && (
        <div className="mb-4 p-4 rounded-2xl bg-muted/5 border border-border/30">
          <RenderContent content={content} />
        </div>
      )}

      {/* Graph */}
      {graphData && graphData.length > 0 && (
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
          maxHeight: expanded ? `${steps.length * 300 + 400}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="space-y-3 sm:space-y-4 py-1">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2.5 sm:gap-3 items-start">
              {/* Step number bubble */}
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-primary/30 bg-primary/5 text-primary flex items-center justify-center text-[9px] sm:text-[10px] font-display mt-0.5">
                {i + 1}
              </div>

              <div className="flex-1 min-w-0 overflow-hidden space-y-1.5">
                {/* Step label */}
                <p className="text-[10px] tracking-wide uppercase font-display text-muted-foreground">
                  {step.label}
                </p>

                {/* Math expression */}
                <MathBlock expr={step.math} />

                {/* Explanation */}
                {step.explanation && (
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                    <ChevronRight
                      size={9}
                      className="inline mr-1 text-primary"
                    />
                    {step.explanation}
                  </p>
                )}

                {step.subSteps && step.subSteps.length > 0 && (
                  <div className="mt-1.5 ml-1 pl-3 border-l border-primary/20 space-y-1">
                    {step.subSteps.map((sub, j) => (
                      <p
                        key={j}
                        className="text-[10px] sm:text-[11px] font-mono text-primary/70 leading-relaxed"
                      >
                        <span className="text-primary/40 mr-2 font-display">
                          {String.fromCharCode(97 + j)})
                        </span>
                        {sub}
                      </p>
                    ))}
                  </div>
                )}

                {step.note && (
                  <div className="mt-2 flex gap-2 items-start px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <Lightbulb
                      size={11}
                      className="text-amber-400 flex-shrink-0 mt-0.5"
                    />
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
      <div className="p-3 sm:p-4 rounded-xl border border-primary/40 bg-primary/8 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <CheckCircle2
            size={15}
            className="flex-shrink-0 text-primary"
          />
          <div className="min-w-0">
            <p className="font-display text-[9px] tracking-[0.25em] mb-0.5 uppercase text-primary/60">
              {t.final_answer}
            </p>
            <p
              className="font-mono text-base sm:text-xl font-bold break-all text-primary"
              style={{
                textShadow: "0 0 20px hsl(120 100% 54% / 0.6)",
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
const TypingIndicator = ({
  t,
}: {
  t: Record<string, string>;
}) => (
  <div className="flex gap-3 sm:gap-4 items-start max-w-3xl mx-auto px-3 sm:px-6 py-3 animate-fade-in-up">
    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
      <Bot size={14} className="text-primary" />
    </div>
    <div className="flex items-center gap-1.5 sm:gap-2 pt-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          style={{ animation: `pulse 1.4s ease-in-out ${delay}s infinite` }}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1 font-display tracking-wider">
        {t.computing}
      </span>
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
    .replace(/\\\( /g, "\\(").replace(/ \\\)/g, "\\)")
    .replace(/\\\[ /g, "\\[").replace(/ \\\]/g, "\\]")
    // Ensure tables have spacing
    .replace(/\n(\|.*\|)\n/g, "\n\n$1\n\n")
    // Safety net: Clean naked LaTeX commands if not wrapped in math blocks
    .replace(/\\left\(/g, "(").replace(/\\right\)/g, ")")
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
        if (trimmedPara.includes("|") && trimmedPara.split("\n").some(l => l.includes("|---"))) {
          return <TableRenderer key={pIdx} markdown={trimmedPara} />;
        }

        // --- SECTION HEADER DETECTION
        const isHeaderOnly = trimmedPara.split("\n").length === 1 && 
          (/^(Given|Calculation|Conclusion|Shortcut|నిర్ణయం|గణన|ఇవ్వబడింది|షార్ట్|💡|∴)/i.test(trimmedPara) || trimmedPara.match(/^\*\*(.+?)\*\*:?\s*$/));
        
        if (isHeaderOnly) {
          return <SectionHeader key={pIdx} text={trimmedPara} />;
        }

        // Check if paragraph *starts* with a header followed by content
        const lines = trimmedPara.split("\n");
        const firstLine = lines[0];
        const isInlineHeader = /^(Given|Calculation|Conclusion|Shortcut|నిర్ణయం|గణన|ఇవ్వబడింది|షార్ట్|💡|∴)/i.test(firstLine) && firstLine.includes(":");
        
        const contentLines = isInlineHeader ? lines.slice(1) : lines;

        return (
          <div key={pIdx} className="space-y-3">
            {isInlineHeader && <SectionHeader text={firstLine} />}
            <div className={`space-y-2.5 ${isInlineHeader ? "pl-1 sm:pl-2" : ""}`}>
              {contentLines.map((line, lIdx) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                // Bullet / list item: handles -, •, ▸, *, or numeric like 1.
                if (/^([-•▸*]|\d+\.)\s/.test(trimmedLine)) {
                  const bulletContent = trimmedLine.replace(/^([-•▸*]|\d+\.)\s*/, "");
                  const isStepHeader = /^Step \d+/i.test(bulletContent);
                  
                  return (
                    <div key={lIdx} className={`flex gap-3 items-start ${isStepHeader ? "mt-4 first:mt-0" : ""}`}>
                      <div className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center ${isStepHeader ? "mt-2" : ""}`}>
                         <div className="w-0.5 h-0.5 rounded-full bg-primary" />
                      </div>
                      <span className={`flex-1 ${isStepHeader ? "font-display text-primary tracking-wide text-[11px] sm:text-xs font-bold border-b border-primary/10 pb-1 flex justify-between items-center" : "text-foreground/85"}`}>
                        <InlineRenderer text={bulletContent} />
                      </span>
                    </div>
                  );
                }

                // Math display block: \[...\] or $$...$$
                if (/^(\\\[|\$\$)/.test(trimmedLine) || /(\\\]|\$\$)$/.test(trimmedLine)) {
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
                            <div key={mi} className="min-h-[1.5em]">{mLine.trim()}</div>
                          ))}
                        </code>
                      </div>
                    );
                  }
                  return null;
                }

                // Regular line
                const isConclusionArrow = trimmedLine.startsWith("⇒") || trimmedLine.startsWith("∴");
                return (
                  <p key={lIdx} className={`text-[13px] sm:text-[15px] leading-relaxed font-body ${isConclusionArrow ? "text-primary/95 font-medium pl-3 border-l-2 border-primary/20 py-1 bg-primary/5 rounded-r-lg" : "text-foreground/80"}`}>
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
      className={`group flex gap-2.5 sm:gap-4 max-w-4xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}
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
          className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed overflow-hidden ${
            isUser
              ? "bg-primary/10 border border-primary/25 text-foreground rounded-tr-sm max-w-[90%] sm:max-w-[85%] whitespace-pre-wrap"
              : "bg-muted/20 border border-border/50 text-foreground rounded-tl-sm w-full"
          }`}
        >
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <RenderContent content={msg.content} />
          )}
          {msg.solution && (
            <SolutionPanel
              steps={msg.solution.steps}
              finalAnswer={msg.solution.finalAnswer}
              method={msg.solution.method}
              graphData={msg.solution.graphData}
              content={msg.content} // Pass content for exporting together
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
const EmptyState = ({
  onPrompt,
  t,
  prompts,
}: {
  onPrompt: (p: string) => void;
  t: Record<string, string>;
  prompts: { label: string; prompt: string }[];
}) => (
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
    [activeId, isTyping, language, t.error_backend],
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
            <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-6 pb-2">
              {activeConv?.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} t={t} />
              ))}
              {isTyping && <TypingIndicator t={t} />}
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
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-end px-1 gap-2 flex-wrap">
              <LanguageToggle
                language={language}
                onChange={handleLanguageChange}
              />
            </div>

            {/* Text input row */}
            <div
              className={`flex gap-2 items-end rounded-xl sm:rounded-2xl border bg-muted/10 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 ${
                isOverLimit
                  ? "border-destructive/60"
                  : "border-border/60 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(120_100%_54%/0.08)]"
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
                  disabled={isTyping || !input.trim() || isOverLimit || cooldown > 0}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isTyping && !isOverLimit && cooldown === 0
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-[0_0_15px_hsl(120_100%_54%/0.4)]"
                      : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {cooldown > 0 ? (
                    <span className="text-[10px] font-bold font-mono text-primary/60">{cooldown}s</span>
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </div>
            </div>

            {/* Hint text */}
            <p className="hidden sm:block text-[10px] text-muted-foreground/60 text-center font-body">
              {t.enter_to_send} <kbd className="font-mono opacity-80">Enter</kbd>{" "}
              {t.to_send} <kbd className="font-mono opacity-80">Shift+Enter</kbd>{" "}
              {t.new_line}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

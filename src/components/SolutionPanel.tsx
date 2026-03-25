import { useState } from "react";
import { ChevronRight, CheckCircle2, Lightbulb, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface Step {
  label: string;
  math: string;
  explanation?: string;
}

interface SolutionPanelProps {
  steps: Step[];
  finalAnswer: string;
  method?: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1 rounded text-muted-foreground hover:text-primary transition-colors duration-200 flex-shrink-0"
    >
      {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
    </button>
  );
};

const MathBlock = ({ expr }: { expr: string }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="font-mono text-sm md:text-base px-3 py-1.5 rounded bg-primary/5 border border-primary/20 text-primary neon-text inline-block break-all">
      {expr}
    </div>
    <CopyButton text={expr} />
  </div>
);

const SolutionPanel = ({ steps, finalAnswer, method }: SolutionPanelProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mt-3 space-y-3">
      {/* Header row: method badge + toggle */}
      <div className="flex items-center justify-between gap-2">
        {method && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb size={13} className="text-primary flex-shrink-0" />
            <span className="tracking-wider uppercase font-display truncate">{method}</span>
          </div>
        )}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="ml-auto flex items-center gap-1 text-[10px] font-display tracking-widest text-primary/70 hover:text-primary transition-colors duration-200 border border-primary/20 rounded px-2 py-1 hover:border-primary/40 flex-shrink-0"
        >
          {expanded ? (
            <>HIDE STEPS <ChevronUp size={11} /></>
          ) : (
            <>SHOW STEPS <ChevronDown size={11} /></>
          )}
        </button>
      </div>

      {/* Collapsible Steps */}
      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: expanded ? `${steps.length * 200}px` : "0px", opacity: expanded ? 1 : 0 }}
      >
        <div className="space-y-3 pb-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-3 items-start animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
              {/* Step number bubble */}
              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-primary/30 flex items-center justify-center text-[10px] sm:text-xs font-display text-primary mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase font-display">
                  {step.label}
                </p>
                <MathBlock expr={step.math} />
                {step.explanation && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed font-body">
                    <ChevronRight size={9} className="inline mr-1 text-primary" />
                    {step.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Answer */}
      <div
        className="mt-2 p-3 sm:p-4 rounded-lg border border-primary/40 bg-primary/10 neon-box animate-fade-in-up"
        style={{ animationDelay: `${(steps.length + 1) * 0.1}s` }}
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
            <span className="font-display text-[10px] sm:text-xs tracking-[0.3em] text-primary uppercase">
              Final Answer
            </span>
          </div>
          <CopyButton text={finalAnswer} />
        </div>
        <div className="font-mono text-lg sm:text-xl md:text-2xl text-primary neon-text-strong font-bold break-all">
          {finalAnswer}
        </div>
      </div>
    </div>
  );
};

export default SolutionPanel;

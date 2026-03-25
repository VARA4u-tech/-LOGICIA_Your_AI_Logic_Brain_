import { ChevronRight, CheckCircle2, Lightbulb } from "lucide-react";

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

const MathBlock = ({ expr }: { expr: string }) => (
  <div className="font-mono text-base md:text-lg px-4 py-2 rounded bg-primary/5 border border-primary/20 text-primary neon-text inline-block">
    {expr}
  </div>
);

const SolutionPanel = ({ steps, finalAnswer, method }: SolutionPanelProps) => {
  return (
    <div className="mt-3 space-y-3">
      {/* Method badge */}
      {method && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb size={14} className="text-primary" />
          <span className="tracking-wider uppercase font-display">{method}</span>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-3 items-start animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 0.15}s` }}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full border border-primary/30 flex items-center justify-center text-xs font-display text-primary mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-xs text-muted-foreground tracking-wide uppercase font-display">
                {step.label}
              </p>
              <MathBlock expr={step.math} />
              {step.explanation && (
                <p className="text-xs text-muted-foreground leading-relaxed font-body">
                  <ChevronRight size={10} className="inline mr-1 text-primary" />
                  {step.explanation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final Answer */}
      <div
        className="mt-4 p-4 rounded-lg border border-primary/40 bg-primary/10 neon-box animate-fade-in-up"
        style={{ animationDelay: `${(steps.length + 1) * 0.15}s` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="font-display text-xs tracking-[0.3em] text-primary uppercase">Final Answer</span>
        </div>
        <div className="font-mono text-xl md:text-2xl text-primary neon-text-strong font-bold">
          {finalAnswer}
        </div>
      </div>
    </div>
  );
};

export default SolutionPanel;

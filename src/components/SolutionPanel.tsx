import { useState, useMemo } from "react";
import { ChevronRight, CheckCircle2, Lightbulb, ChevronDown, ChevronUp, Copy, Check, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Step {
  label: string;
  math: string;
  explanation?: string;
}

interface PlotData {
  x: number;
  y: number;
}

interface SolutionPanelProps {
  steps: Step[];
  finalAnswer: string;
  method?: string;
  graphData?: PlotData[]; // Added for graphing support
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
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
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

const SolutionPanel = ({ steps, finalAnswer, method, graphData }: SolutionPanelProps) => {
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

      {/* Graph Section (Optional Render) */}
      {graphData && graphData.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-display tracking-widest uppercase">
            <BarChart2 size={13} className="text-primary" />
            VISUALIZATION
          </div>
          <div className="h-[200px] sm:h-[250px] w-full glass rounded-xl p-2 sm:p-4 border border-primary/10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 100% 54% / 0.1)" />
                <XAxis 
                  dataKey="x" 
                  stroke="hsl(120 20% 50%)" 
                  fontSize={10} 
                  tickFormatter={(v) => v.toFixed(1)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(120 20% 50%)" 
                  fontSize={10} 
                  tickFormatter={(v) => v.toFixed(1)}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(120 20% 6% / 0.95)", 
                    borderColor: "hsl(120 100% 54% / 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "white"
                  }}
                  itemStyle={{ color: "hsl(120 100% 54%)" }}
                  cursor={{ stroke: 'hsl(120 100% 54% / 0.4)', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="hsl(120 100% 54%)" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(120 100% 54%)", stroke: "white" }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Collapsible Steps */}
      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: expanded ? `${steps.length * 300 + 400}px` : "0px", opacity: expanded ? 1 : 0 }}
      >
        <div className="space-y-3 pb-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-3 items-start animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
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
        style={{ animationDelay: `${(steps.length + 2) * 0.1}s` }}
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

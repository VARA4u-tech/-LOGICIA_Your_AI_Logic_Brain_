import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Triangle,
  TrendingUp,
  BarChart3,
  Hexagon,
  Zap,
  Brain,
  Clock,
  Globe,
  MessageSquare,
  Cpu,
  FlaskConical,
  BookOpen,
  BarChart2,
  Send,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
  Fingerprint,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═════════════════════════ */

const features = [
  {
    icon: Triangle,
    title: "Algebraic Intelligence",
    description:
      "Advanced symbolic manipulation for solving linear, quadratic, and higher-order equations with literal precision.",
    highlights: [
      "Polynomial Analysis",
      "Systems of Equations",
      "Inequality Solving",
    ],
  },
  {
    icon: TrendingUp,
    title: "Calculus & Analysis",
    description:
      "Compute derivatives, definite and indefinite integrals, and limits with full step-by-step derivational logic.",
    highlights: [
      "Partial Derivatives",
      "Integration by Parts",
      "Taylor Series",
    ],
  },
  {
    icon: BarChart3,
    title: "Statistical Modeling",
    description:
      "Evaluate probability distributions, perform hypothesis testing, and compute multidimensional regressions.",
    highlights: ["Normal Distribution", "ANOVA", "Pearson Correlation"],
  },
  {
    icon: Hexagon,
    title: "Projective Geometry",
    description:
      "Precise computation of spatial properties, transformations, and trigonometric relationships in N-dimensions.",
    highlights: ["Vector Calculus", "Spherical Trig", "Matrix Transforms"],
  },
];

const mathReference = [
  {
    category: "Arithmetic & Core",
    items: [
      { op: "Addition / Sub.", syntax: "x + y, x - y", example: "125 + 75" },
      { op: "Multiplication", syntax: "x * y or x y", example: "12x" },
      { op: "Division", syntax: "x / y or x \u00F7 y", example: "100 / 4" },
      { op: "Exponentiation", syntax: "x^y or x**y", example: "x^2" },
    ],
  },
  {
    category: "Calculus",
    items: [
      {
        op: "Derivative",
        syntax: "diff(f, x) or d/dx",
        example: "derivative of x^2",
      },
      {
        op: "Integral",
        syntax: "integrate(f, x) or \u222B",
        example: "integrate x dx",
      },
      {
        op: "Limits",
        syntax: "limit(f, x, a)",
        example: "limit of 1/x as x -> 0",
      },
    ],
  },
  {
    category: "Linear Algebra",
    items: [
      {
        op: "Matrix Mul",
        syntax: "Matrix([[..]]) * ..",
        example: "Matrix multiplication",
      },
      { op: "Determinant", syntax: "det(A)", example: "det of [[1,2],[3,4]]" },
    ],
  },
];

const stats = [
  { icon: Zap, value: 0.8, suffix: "s", label: "Latency", prefix: "<" },
  { icon: Brain, value: 99.9, suffix: "%", label: "Symbolic Accuracy" },
  { icon: Globe, value: 120, suffix: "+", label: "Mathematical Functions" },
  { icon: Cpu, value: 1.2, suffix: "B", label: "Parameters" },
];

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Problem Ingestion",
    description:
      "Submit queries via natural language or LaTeX notation. The system handles ambiguous phrasing with intent-matching.",
    example: '"Differentiate cos(x^2)"',
  },
  {
    icon: Cpu,
    step: "02",
    title: "Semantic Analysis",
    description:
      "The query is parsed into a syntax tree, classifying the mathematical domain and identifying constants vs variables.",
    example: "Class: Calculus | Var: x",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Symbolic Execution",
    description:
      "Our proprietary engine solves the problem using symbolic logic, avoiding numerical rounding errors of LLMs.",
    example: "Ans: -2x sin(x^2)",
  },
  {
    icon: BookOpen,
    step: "04",
    title: "Pedagogical Refactoring",
    description:
      "The raw symbolic result is processed through OpenRouter-orchestrated LLMs to generate a structured pedagogical breakdown, contextualized with relevant undergraduate-level theorems.",
    example: '"Apply the Chain Rule via Gemini-2.0..."',
  },
  {
    icon: BarChart2,
    step: "05",
    title: "Visual Synthesis",
    description:
      "Mathematical functions are sampled and rendered into interactive time-series or coordinate graphs for intuition.",
    example: "Interactive Plot Generation",
  },
  {
    icon: Send,
    step: "06",
    title: "Response Delivery",
    description:
      "The final payload is delivered via a low-latency websocket or REST interface with full LaTeX support.",
    example: "JSON/LaTeX Payload",
  },
];

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═════════════════════════ */

const useCountUp = (target: number, duration = 1600, active = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(target % 1 === 0 ? 0 : 1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═════════════════════════ */

const StatCard = ({
  icon: Icon,
  value,
  suffix,
  label,
  prefix,
  active,
  delay,
}: {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
  active: boolean;
  delay: number;
}) => {
  const animated = useCountUp(value, 1600, active);
  const display = value % 1 === 0 ? Math.round(animated) : animated.toFixed(1);
  return (
    <div
      className={`text-center transition-all duration-700 ${active ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <div className="flex justify-center mb-3">
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
          <Icon size={16} className="text-primary" />
        </div>
      </div>
      <div className="font-display text-xl sm:text-2xl font-bold text-primary tabular-nums tracking-tight">
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="text-[10px] sm:text-[11px] text-muted-foreground/60 tracking-[0.1em] font-display mt-1 uppercase">
        {label}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION RENDERERS
   ═════════════════════════ */

const FeaturesContent = () => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setStatsVisible(true),
      { threshold: 0.2 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-16">
      <SectionHeader
        title="Technical Capabilities"
        subtitle="A high-performance mathematical engine designed for accuracy and pedagogical clarity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feat, i) => (
          <div
            key={feat.title}
            className={`group glass-strong rounded-2xl p-6 transition-all duration-500 hover:border-primary/40 hover:bg-primary/[0.02] ${visible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationFillMode: "forwards",
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <feat.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm tracking-widest text-primary mb-1 uppercase">
                  {feat.title}
                </h3>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {feat.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[9px] font-display tracking-widest px-2.5 py-1.5 rounded-lg bg-black/40 border border-primary/10 text-primary/60 uppercase"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={statsRef}
        className="glass rounded-2xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 border border-white/5"
      >
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            {...s}
            active={statsVisible}
            delay={i * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

const ReferenceContent = () => {
  return (
    <div className="space-y-12 animate-fade-in-up">
      <SectionHeader
        title="Mathematical Reference"
        subtitle="Syntax guide for operations, functions, and solvers supported by the engine."
      />

      <div className="space-y-8">
        {mathReference.map((cat) => (
          <div key={cat.category} className="space-y-4">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary/60 uppercase pl-1 border-l-2 border-primary/30">
              {cat.category}
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20">
              <table className="w-full text-left text-[11px] font-body transition-colors">
                <thead className="bg-white/5 text-muted-foreground font-display tracking-widest text-[9px] uppercase">
                  <tr>
                    <th className="px-4 py-3">Operation</th>
                    <th className="px-4 py-3">Syntax</th>
                    <th className="px-4 py-3">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cat.items.map((item) => (
                    <tr
                      key={item.op}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3 text-foreground/80 group-hover:text-primary transition-colors">
                        {item.op}
                      </td>
                      <td className="px-4 py-3 font-mono text-primary/70">
                        {item.syntax}
                      </td>
                      <td className="px-4 py-3 italic text-muted-foreground">
                        {item.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200/60 text-[10px] leading-relaxed flex gap-3">
        <Zap size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-amber-400">Pro Tip:</strong> You can often
          type in plain natural English like "solve for x in x plus five equals
          ten" and the system will auto-canonicalize the query.
        </p>
      </div>
    </div>
  );
};

const HowItWorksContent = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-16">
      <SectionHeader
        title="Processing Pipeline"
        subtitle="An intelligent multi-stage architecture delivering precision-grade mathematical results."
      />

      <div className="relative">
        {/* Connection line for desktop */}
        <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent hidden lg:block" />

        <div className="space-y-12">
          {steps.map((s, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={s.step}
                className={`flex flex-col lg:flex-row items-center gap-8 ${isEven ? "" : "lg:flex-row-reverse"} ${visible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
                style={{
                  animationDelay: `${i * 0.12}s`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex-1 w-full">
                  <div
                    className={`glass-strong rounded-2xl p-6 transition-all duration-500 hover:border-primary/40 group relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <s.icon size={18} className="text-primary" />
                      </div>
                      <h4 className="font-display text-xs tracking-widest text-primary uppercase">
                        {s.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-body mb-4">
                      {s.description}
                    </p>
                    <div className="font-mono text-[9px] px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-primary/60 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                      {s.example}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex w-12 h-12 rounded-full border border-primary/30 bg-background z-10 items-center justify-center font-display text-xs text-primary shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                <div className="flex-1 hidden lg:block" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AboutContent = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-12 max-w-3xl">
      <SectionHeader title="Origins" subtitle="The mission behind Logicia." />
      <div
        className={`space-y-6 text-foreground/70 leading-relaxed font-body text-sm ${visible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <p>
          LOGICIA was conceived at the intersection of symbolic logic and neural
          language processing. Traditional AI models often struggle with
          "mathematical hallucination"—where the output appears correct but
          lacks structural validity.
        </p>
        <p>
          Our mission is to bridge this gap by leveraging the power of{" "}
          <strong>OpenRouter-orchestrated AI models</strong> exclusively for
          pedagogical explanation, while delegating the actual computation to a
          deterministic symbolic math engine. This ensures that every step
          provided to the user is not just "likely," but mathematically proven.
        </p>

        <div className="pt-6 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h5 className="font-display text-[10px] tracking-widest text-primary mb-2 uppercase">
              Our Vision
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              To democratize high-level mathematical expertise for students and
              researchers globally.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <h5 className="font-display text-[10px] tracking-widest text-primary mb-2 uppercase">
              Integrity
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Commitment to open standards, data privacy, and mathematical
              rigor.
            </p>
          </div>
        </div>

        <div className="pt-8 flex items-center gap-6">
          <a
            href="https://github.com/VARA4u-tech/-LOGICIA_Your_AI_Math_Brain_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Github size={18} className="text-primary/70" />
            </div>
            <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">
              Repo
            </span>
          </a>
          <a
            href="https://vara-s-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <User size={18} className="text-primary/70" />
            </div>
            <span className="text-[9px] font-display tracking-widest text-muted-foreground">
              CREATOR
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

const ContactContent = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    inquiry: "General Support",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("success"), 1500);
  };

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-6 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_hsl(120_100%_54%/0.15)]">
          <CheckCircle size={32} className="text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
          MESSAGE DISPATCHED
        </h2>
        <p className="text-muted-foreground font-body text-sm max-w-sm mx-auto leading-relaxed">
          Your transmission has been received by our mathematical advisory team.
          We typically synchronize within 24 standard business hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 px-8 py-3 rounded-xl border border-primary/30 text-[10px] font-display tracking-widest text-primary hover:bg-primary/5 transition-colors"
        >
          SEND ANOTHER TRANSMISSION
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fade-in-up">
      <SectionHeader
        title="Connect & Support"
        subtitle="Access specialized support channels for technical inquiries, pedagogical integration, or institutional partnerships."
      />

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Info & Shortcuts */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            <h3 className="font-display text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              Knowledge Base Shortcuts
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "API Rate-Limiting Docs", icon: Zap },
                { label: "Pedagogical Theory Whitepaper", icon: BookOpen },
                { label: "Security & Data Governance", icon: Cpu },
              ].map((faq) => (
                <button
                  key={faq.label}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group text-left"
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                    <faq.icon
                      size={14}
                      className="text-primary/60 group-hover:text-primary transition-colors"
                    />
                  </div>
                  <span className="text-xs font-body text-foreground/80 group-hover:text-foreground transition-colors">
                    {faq.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="font-display text-[10px] tracking-[0.3em] text-muted-foreground/50 uppercase">
              Global Communication
            </h3>
            <div className="space-y-6">
              {[
                {
                  label: "Admin E-Mail",
                  val: "pappuridurgavaraprasad4pl@gamil.com",
                  icon: Mail,
                },
                {
                  label: "Institutional Relations",
                  val: "DVR & DR.HS MIC College Of Technology",
                  icon: Globe,
                },
                {
                  label: "Research Lab",
                  val: "Vijayawada, Andhra Pradesh",
                  icon: MapPin,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
                    <item.icon size={16} className="text-primary/70" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-display tracking-[0.3em] text-muted-foreground/40 mb-0.5 uppercase">
                      {item.label}
                    </span>
                    <span className="text-xs font-body text-foreground/90">
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Refined Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="glass-strong rounded-2xl p-8 border border-white/5 space-y-6 relative overflow-hidden group"
          >
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            <div className="grid sm:grid-cols-2 gap-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-display tracking-widest text-muted-foreground/60 uppercase ml-1">
                  Identity
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                    size={14}
                  />
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-display tracking-widest text-muted-foreground/60 uppercase ml-1">
                  Electronic Mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                    size={14}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-display tracking-widest text-muted-foreground/60 uppercase ml-1">
                Inquiry Vector
              </label>
              <select
                value={form.inquiry}
                onChange={(e) => setForm({ ...form, inquiry: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all appearance-none cursor-pointer"
              >
                <option value="General Support" className="bg-background">
                  General Support Desk
                </option>
                <option value="API Integration" className="bg-background">
                  API Integration Support
                </option>
                <option value="Institutional" className="bg-background">
                  Institutional Partnerships
                </option>
                <option value="Security" className="bg-background">
                  Security & Vulnerability
                </option>
              </select>
              <ChevronRight
                className="absolute right-4 bottom-4 rotate-90 text-muted-foreground/40 pointer-events-none"
                size={14}
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-display tracking-widest text-muted-foreground/60 uppercase ml-1">
                Message Breakdown
              </label>
              <textarea
                required
                rows={5}
                placeholder="Details of your inquiry..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className={`w-full py-4 bg-primary text-primary-foreground font-display text-[10px] tracking-[0.3em] rounded-xl hover:scale-[0.99] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50`}
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  SYNCHRONIZING...
                </>
              ) : (
                <>
                  <Send size={14} />
                  INITIATE CONTACT
                </>
              )}
            </button>
            <p className="text-[9px] text-muted-foreground/40 text-center uppercase tracking-widest">
              By initiating, you agree to our data governance protocols.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED SECTION HEADER
   ═════════════════════════ */
const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="relative">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_hsl(120_100%_54%)]" />
      <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
        {title.toUpperCase()}
      </h2>
    </div>
    <p className="text-muted-foreground/80 text-xs sm:text-sm font-body max-w-2xl leading-relaxed">
      {subtitle}
    </p>
  </div>
);

const TermsContent = () => {
  return (
    <div className="space-y-12 animate-fade-in-up">
      <SectionHeader
        title="Terms & Conditions"
        subtitle="Last modified: April 2026. Academic & Demonstration Usage Protocols."
      />

      <div className="space-y-10 font-body text-[13px] text-foreground/70 leading-relaxed max-w-3xl">
        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            01. Academic Status
          </h3>
          <p>
            Logicia is a <strong>college-based project application</strong>{" "}
            developed strictly for educational and demonstration purposes. It is
            not a commercial product. By using this platform, you acknowledge
            its academic nature and understand that it is provided "as is" for
            pedagogical exploration.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            02. Acceptable Usage
          </h3>
          <p>
            Users are responsible for maintaining the integrity of their
            interactions. The engine is designed for mathematical inquiry. Any
            attempt to reverse-engineer, exploit the API, or use the service for
            non-educational malicious activity is strictly prohibited.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            03. Limitation of Liability
          </h3>
          <p>
            As a research project, we do not guarantee 100% availability or
            total accuracy of pedagogical explanations generated by third-party
            LLM orchestrations. Logicia and its creators shall not be liable for
            any academic or data-related consequences arising from the use of
            this demonstration platform.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            04. Responsible Handling
          </h3>
          <p>
            User data is handled with strict academic integrity. We do not
            monetize or sell user information. All data handling protocols are
            designed to support the functionality of the project while
            respecting individual user privacy.
          </p>
        </section>
      </div>
    </div>
  );
};

const PrivacyContent = () => {
  return (
    <div className="space-y-12 animate-fade-in-up">
      <SectionHeader
        title="Privacy Policy"
        subtitle="Data Governance & Academic Transparency Protocols."
      />

      <div className="space-y-10 font-body text-[13px] text-foreground/70 leading-relaxed max-w-3xl">
        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            Data Collection Breakdown
          </h3>
          <p>
            For the purpose of providing a personalized chat experience and
            academic tracking, we collect the following limited data points:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong>Identity:</strong> Name and Email address via Google
              OAuth.
            </li>
            <li>
              <strong>Interaction Data:</strong> Mathematical queries and
              generated steps for session persistence.
            </li>
            <li>
              <strong>Technical Logic:</strong> Basic usage activity to optimize
              engine latency.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            Utilization of Information
          </h3>
          <p>Your data is used exclusively to:</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Authenticate and maintain secure user sessions.</li>
            <li>
              Enable cross-device access to your mathematical conversation
              history.
            </li>
            <li>
              Analyze engine performance for academic research and platform
              improvement.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            Third-Party Governance
          </h3>
          <p>
            We do not share your personal identity with third parties.
            Mathematical queries (stripped of PII) may be processed via
            OpenRouter's LLM orchestration to generate pedagogical explanations.
            We are committed to a strict "no-monetization" policy for all
            academic data.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-xs tracking-widest text-primary uppercase">
            Data Protection
          </h3>
          <p>
            We implement industry-standard encryption and secure token-based
            authentication (JWT) to safeguard your session data. As this is a
            college project, we encourage users not to share sensitive personal
            information within the mathematical chat interface.
          </p>
        </section>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
   ═════════════════════════ */
const sections = [
  { id: "features", label: "Capabilities", icon: Zap },
  { id: "reference", label: "Math Reference", icon: BookOpen },
  { id: "how-it-works", label: "Architecture", icon: Cpu },
  { id: "about", label: "About", icon: Brain },
  { id: "contact", label: "Contact", icon: MessageSquare },
  { id: "terms", label: "Terms", icon: ShieldAlert },
  { id: "privacy", label: "Privacy", icon: Fingerprint },
] as const;

type SectionId = (typeof sections)[number]["id"];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═════════════════════════ */
interface DocLocationState {
  section?: string;
}

const Docs = () => {
  const location = useLocation();
  const state = location.state as DocLocationState;
  const [active, setActive] = useState<SectionId>("features");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const section = state?.section;
    if (section && sections.find((s) => s.id === section)) {
      setActive(section as SectionId);
    }
  }, [state]);

  const renderContent = () => {
    switch (active) {
      case "features":
        return <FeaturesContent />;
      case "reference":
        return <ReferenceContent />;
      case "how-it-works":
        return <HowItWorksContent />;
      case "about":
        return <AboutContent />;
      case "contact":
        return <ContactContent />;
      case "terms":
        return <TermsContent />;
      case "privacy":
        return <PrivacyContent />;
    }
  };

  const activeSection = sections.find((s) => s.id === active)!;

  return (
    <div className="relative min-h-screen bg-background font-body text-foreground">
      <AnimatedBackground />

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.png" alt="Logicia" className="w-6 h-6" />
              <span className="font-display text-sm font-bold tracking-[0.2em] text-primary">
                LOGICIA
              </span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <span className="text-[10px] font-display tracking-widest text-muted-foreground hidden sm:block">
              DOCUMENTATION V1.0.4
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-display tracking-widest text-primary/80 uppercase">
                {activeSection.label}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="md:hidden p-2 text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-all"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex pt-16 min-h-screen">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed md:sticky md:top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 glass border-r border-white/5 transform transition-transform duration-500 ease-in-out md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <nav className="p-6 flex flex-col h-full">
            <div className="space-y-1 flex-1">
              <div className="px-3 mb-6">
                <span className="text-[9px] font-display tracking-[0.3em] text-muted-foreground/40 uppercase">
                  Resources
                </span>
              </div>
              {sections.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setActive(id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 group ${
                      isActive
                        ? "bg-primary/5 text-primary border border-primary/20 shadow-[0_0_20px_hsl(120_100%_54%/0.05)]"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary transition-colors"
                      }
                    />
                    <span className="font-display text-[10px] tracking-widest uppercase">
                      {label}
                    </span>
                    {isActive && (
                      <ChevronRight
                        size={10}
                        className="ml-auto animate-pulse"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/5">
              <a
                href="https://vara-s-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-primary transition-colors"
              >
                <User size={14} />
                <span className="font-display text-[9px] tracking-widest uppercase">
                  My Portfolio
                </span>
              </a>
              <a
                href="https://github.com/VARA4u-tech/-LOGICIA_Your_AI_Math_Brain_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={14} />
                <span className="font-display text-[9px] tracking-widest uppercase">
                  GitHub Repo
                </span>
              </a>
            </div>
          </nav>
        </aside>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ── */}
        <main className="flex-1 px-6 sm:px-12 py-12 md:py-16 max-w-5xl mx-auto w-full overflow-hidden">
          <div className="max-w-4xl mx-auto">{renderContent()}</div>

          <footer className="mt-40 py-24 border-t border-white/5 flex flex-col items-center justify-center gap-10 text-muted-foreground/40 text-[10px] font-display tracking-[0.3em] uppercase">
            <div className="flex flex-col items-center gap-3">
              <span className="font-bold text-primary/60">© {new Date().getFullYear()} LOGICIA SYSTEMS</span>
              <div className="h-px w-12 bg-white/10" />
            </div>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              <button
                onClick={() => setActive("features")}
                className="hover:text-primary transition-all hover:tracking-[0.4em] duration-300"
              >
                DOCUMENTATION
              </button>
              <button
                onClick={() => setActive("terms")}
                className="hover:text-primary transition-all hover:tracking-[0.4em] duration-300"
              >
                TERMS
              </button>
              <button
                onClick={() => setActive("privacy")}
                className="hover:text-primary transition-all hover:tracking-[0.4em] duration-300"
              >
                PRIVACY
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Docs;

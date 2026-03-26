import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */

const features = [
  {
    icon: Triangle,
    title: "ALGEBRA",
    description:
      "Solve equations, simplify expressions, factor polynomials, and work with inequalities instantly.",
    highlights: ["Linear & Quadratic", "Polynomials", "Systems of Equations"],
  },
  {
    icon: TrendingUp,
    title: "CALCULUS",
    description:
      "Derivatives, integrals, limits, and series — all computed with full step-by-step breakdowns.",
    highlights: ["Derivatives", "Integrals", "Limits & Series"],
  },
  {
    icon: BarChart3,
    title: "STATISTICS",
    description:
      "Probability, distributions, hypothesis testing, and regression analysis made simple.",
    highlights: ["Probability", "Distributions", "Regression"],
  },
  {
    icon: Hexagon,
    title: "GEOMETRY",
    description:
      "Areas, volumes, transformations, and proofs — visualized and solved with precision.",
    highlights: ["2D & 3D Shapes", "Transformations", "Trigonometry"],
  },
];

const stats = [
  { icon: Zap, value: 1, suffix: "s", label: "Response Time", prefix: "<" },
  { icon: Brain, value: 99.9, suffix: "%", label: "Accuracy Rate" },
  { icon: Clock, value: 24, suffix: "/7", label: "Availability" },
  { icon: Globe, value: 50, suffix: "+", label: "Math Topics" },
];

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "INPUT",
    description:
      "You type any math problem — from basic arithmetic to advanced calculus — in natural language or math notation.",
    example: '"Solve x² − 5x + 6 = 0"',
  },
  {
    icon: Cpu,
    step: "02",
    title: "CLASSIFY",
    description:
      "The AI engine instantly identifies the problem type — Algebra, Calculus, Statistics, or Geometry — and routes it correctly.",
    example: "→ Quadratic Algebra",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "SOLVE",
    description:
      "A symbolic math engine computes the accurate result. No AI guessing — pure mathematical precision guaranteed.",
    example: "x₁ = 3, x₂ = 2",
  },
  {
    icon: BookOpen,
    step: "04",
    title: "EXPLAIN",
    description:
      "AI converts the raw solution into step-by-step human-readable explanations, just like a real math tutor would.",
    example: '"Apply the quadratic formula..."',
  },
  {
    icon: BarChart2,
    step: "05",
    title: "VISUALIZE",
    description:
      "Where applicable, graphs and visual aids are generated to help you truly understand the problem intuitively.",
    example: "Graph of f(x) = x² − 5x + 6",
  },
  {
    icon: Send,
    step: "06",
    title: "DELIVER",
    description:
      "The complete solution — steps, explanation, and visuals — is delivered back instantly in the chat interface.",
    example: "< 1 second response",
  },
];

const highlights = [
  {
    icon: Cpu,
    title: "AI-POWERED ENGINE",
    desc: "Advanced neural architecture processes complex equations in milliseconds with near-perfect accuracy.",
  },
  {
    icon: Zap,
    title: "INSTANT SOLUTIONS",
    desc: "Get complete step-by-step breakdowns the moment you submit your problem. No waiting.",
  },
  {
    icon: BookOpen,
    title: "LEARN AS YOU SOLVE",
    desc: "Every solution includes explanations so you understand the method, not just the answer.",
  },
];

const tags = [
  "Neural Networks",
  "Real-Time Processing",
  "LaTeX Rendering",
  "Step-by-Step",
  "Open Source",
  "Mobile-First",
];

/* ═══════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════ */

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
═══════════════════════════════════════════════════════════════ */

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
      className={`text-center transition-all duration-500 ${active ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: "forwards" }}
    >
      <Icon size={18} className="text-primary mx-auto mb-2" />
      <div className="font-display text-2xl sm:text-3xl font-bold text-primary neon-text tabular-nums">
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wider font-body mt-1">
        {label}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION RENDERERS
═══════════════════════════════════════════════════════════════ */

const FeaturesContent = () => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <SectionHeader
        title="CAPABILITIES"
        subtitle="Powered by advanced AI to solve any mathematical challenge"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {features.map((feat, i) => (
          <div
            key={feat.title}
            className={`group glass-strong rounded-xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box ${visible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
            style={{
              animationDelay: `${i * 0.12}s`,
              animationFillMode: "forwards",
            }}
          >
            <div className="w-10 h-10 rounded-lg border border-primary/30 flex items-center justify-center mb-4 group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
              <feat.icon size={18} className="text-primary" />
            </div>
            <h3 className="font-display text-xs tracking-[0.2em] text-primary mb-2">
              {feat.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body mb-3">
              {feat.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {feat.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[9px] sm:text-[10px] font-display tracking-wider px-2 py-1 rounded border border-primary/20 text-primary/70"
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
        className="glass rounded-xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-5"
      >
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            {...s}
            active={statsVisible}
            delay={i * 0.12}
          />
        ))}
      </div>
    </div>
  );
};

const HowItWorksContent = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <SectionHeader
        title="HOW IT WORKS"
        subtitle="A six-stage intelligent pipeline — from your input to the perfect answer"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((s, i) => (
          <div
            key={s.step}
            className={`group relative glass-strong rounded-xl p-5 sm:p-6 transition-all duration-500 hover:border-primary/40 hover:neon-box ${visible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationFillMode: "forwards",
            }}
          >
            <span className="absolute top-4 right-4 font-display text-4xl font-black text-primary/5 select-none group-hover:text-primary/10 transition-colors">
              {s.step}
            </span>
            <div className="w-10 h-10 rounded-lg border border-primary/30 flex items-center justify-center mb-4 group-hover:neon-box group-hover:bg-primary/10 transition-all duration-300">
              <s.icon size={16} className="text-primary" />
            </div>
            <h3 className="font-display text-xs tracking-[0.25em] text-primary mb-2">
              {s.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body mb-3">
              {s.description}
            </p>
            <div className="inline-flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md bg-primary/5 border border-primary/20 text-primary/70">
              <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
              {s.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AboutContent = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <SectionHeader
        title="ABOUT"
        subtitle="The future of mathematical problem solving"
      />
      <div
        className={`grid md:grid-cols-2 gap-8 sm:gap-10 items-start ${visible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <div className="space-y-5">
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-body">
            LOGICIA is a next-generation intelligent math solver built to handle
            everything from basic arithmetic to advanced calculus. Powered by a
            hybrid AI + symbolic engine, it delivers instant, accurate solutions
            with detailed step-by-step explanations.
          </p>
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-body">
            Whether you're a student preparing for exams, a professional
            engineer, or simply curious — our AI breaks down complex problems
            into clear, understandable steps. No more guessing. No more
            struggling. Just answers.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] sm:text-[10px] font-display tracking-[0.15em] px-2.5 py-1 rounded-sm border border-primary/25 text-primary/80 hover:border-primary/50 hover:text-primary transition-colors duration-200"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            {[
              { icon: Github, label: "GitHub" },
              { icon: Twitter, label: "Twitter" },
              { icon: Linkedin, label: "LinkedIn" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded border border-primary/25 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:neon-box transition-all duration-300"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {highlights.map((item, i) => (
            <div
              key={item.title}
              className={`glass-strong rounded-xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start transition-all duration-500 hover:border-primary/40 hover:neon-box ${visible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                animationDelay: `${(i + 1) * 0.15}s`,
                animationFillMode: "forwards",
              }}
            >
              <div className="w-9 h-9 rounded border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-display text-[10px] tracking-[0.2em] text-primary mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContactContent = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1200);
  };

  const btnContent =
    status === "submitting" ? (
      <>
        <Loader2 size={14} className="animate-spin" /> SENDING...
      </>
    ) : status === "success" ? (
      <>
        <CheckCircle size={14} /> MESSAGE SENT
      </>
    ) : (
      <>
        SEND MESSAGE{" "}
        <Send
          size={14}
          className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
        />
      </>
    );

  return (
    <div>
      <SectionHeader title="CONTACT" subtitle="Get in touch with the team" />
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
        <div className="space-y-8 order-2 md:order-1">
          <p className="text-xs sm:text-sm text-foreground/80 leading-loose font-body bg-primary/5 p-5 rounded-xl border border-primary/10">
            Have questions, feedback, or partnership inquiries? We'd love to
            hear from you. Fill out the form or reach out directly, and our team
            will respond within 24 hours.
          </p>
          <div className="space-y-5">
            {[
              { icon: Mail, label: "EMAIL", value: "hello@logicia.ai" },
              { icon: Phone, label: "PHONE", value: "+1 (555) 000-1234" },
              { icon: MapPin, label: "LOCATION", value: "San Francisco, CA" },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-4 group animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:neon-box group-hover:bg-primary/20 transition-all duration-300">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-display text-[9px] tracking-[0.25em] text-primary/70 mb-1">
                    {item.label}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/90 font-body group-hover:text-primary transition-colors">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-6 sm:p-8 space-y-5 order-1 md:order-2 border border-primary/20 hover:border-primary/40 transition-colors duration-500"
        >
          {[
            {
              icon: User,
              type: "text",
              name: "name",
              placeholder: "Your Name",
            },
            {
              icon: Mail,
              type: "email",
              name: "email",
              placeholder: "Email Address",
            },
          ].map(({ icon: Icon, type, name, placeholder }) => (
            <div key={name} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Icon size={15} />
              </div>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={form[name as "name" | "email"]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box focus:bg-primary/5 transition-all duration-300 font-body"
              />
            </div>
          ))}
          <div className="relative group">
            <div className="absolute top-3.5 left-0 pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <MessageSquare size={15} />
            </div>
            <textarea
              required
              placeholder="How can we help you?"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box focus:bg-primary/5 transition-all duration-300 font-body resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={status !== "idle"}
            className={`w-full py-4 border rounded-xl font-display text-[10px] sm:text-xs tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-2.5 group relative overflow-hidden ${
              status === "success"
                ? "bg-primary text-primary-foreground border-primary neon-box cursor-default"
                : status === "submitting"
                  ? "bg-primary/20 text-primary border-primary cursor-wait"
                  : "bg-transparent text-primary border-primary/50 hover:bg-primary/10 hover:border-primary hover:neon-box hover:scale-[1.02]"
            }`}
          >
            {btnContent}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED SECTION HEADER
═══════════════════════════════════════════════════════════════ */
const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-10 sm:mb-14">
    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary neon-text mb-3">
      {title}
    </h2>
    <p className="text-muted-foreground text-xs sm:text-sm font-body tracking-wider">
      {subtitle}
    </p>
    <div className="mt-4 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
═══════════════════════════════════════════════════════════════ */
const sections = [
  { id: "features", label: "Features", icon: Zap },
  { id: "how-it-works", label: "How It Works", icon: Cpu },
  { id: "about", label: "About", icon: Brain },
  { id: "contact", label: "Contact", icon: MessageSquare },
] as const;

type SectionId = (typeof sections)[number]["id"];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const Docs = () => {
  const [active, setActive] = useState<SectionId>("features");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (active) {
      case "features":
        return <FeaturesContent />;
      case "how-it-works":
        return <HowItWorksContent />;
      case "about":
        return <AboutContent />;
      case "contact":
        return <ContactContent />;
    }
  };

  const activeSection = sections.find((s) => s.id === active)!;

  return (
    <div className="relative min-h-screen font-body">
      <AnimatedBackground />

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Left: back + brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
              aria-label="Back to home"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span className="font-display text-[10px] tracking-[0.2em] hidden sm:inline">
                HOME
              </span>
            </Link>
            <span className="text-border">|</span>
            <span className="font-display text-xs sm:text-sm tracking-wider text-primary neon-text">
              LOGICIA DOCS
            </span>
          </div>

          {/* Right: breadcrumb + mobile menu toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-[10px] font-display tracking-wider">
              <ChevronRight size={12} className="text-primary/40" />
              {activeSection.label.toUpperCase()}
            </span>
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="md:hidden p-2 text-primary border border-primary/20 rounded-lg hover:bg-primary/10 hover:border-primary/40 transition-all"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex pt-14 min-h-screen">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed md:sticky md:top-14 left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 glass-strong border-r border-border/50 transform transition-transform duration-300 flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <nav className="p-5 space-y-1 h-full overflow-y-auto">
            <p className="font-display text-[9px] tracking-[0.3em] text-muted-foreground/50 px-3 pb-3 pt-1">
              DOCUMENTATION
            </p>
            {sections.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActive(id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 neon-box"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary transition-colors"
                    }
                  />
                  <span className="font-display text-[11px] tracking-[0.15em]">
                    {label.toUpperCase()}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Sidebar footer */}
            <div className="absolute bottom-5 left-5 right-5">
              <div className="h-px bg-border/50 mb-4" />
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <img src="/logo.png" alt="Logicia" className="w-5 h-5" />
                <span className="font-display text-[9px] tracking-[0.2em]">
                  BACK TO APP
                </span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-5 sm:px-8 md:px-12 py-10 sm:py-14 max-w-4xl">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Docs;

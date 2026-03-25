import { useState } from "react";
import { Send, MapPin, Mail, Phone, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    
    setStatus("submitting");
    
    // Simulate network request
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      
      // Reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    }, 1200);
  };

  const getButtonContent = () => {
    if (status === "submitting") {
      return (
        <>
          <Loader2 size={14} className="animate-spin" />
          SENDING...
        </>
      );
    }
    if (status === "success") {
      return (
        <>
          <CheckCircle size={14} />
          MESSAGE SENT
        </>
      );
    }
    return (
      <>
        SEND MESSAGE 
        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </>
    );
  };

  return (
    <section id="contact" className="relative z-10 py-20 sm:py-24 px-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center font-bold text-primary neon-text mb-3">
          CONTACT
        </h2>
        <p className="text-center text-muted-foreground text-xs sm:text-sm font-body tracking-wider mb-12 sm:mb-16 max-w-xl mx-auto">
          Get in touch with the team
        </p>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          
          {/* Contact info - Left */}
          <div className="space-y-8 sm:space-y-10 order-2 md:order-1">
            <p className="text-xs sm:text-sm text-foreground/80 leading-loose font-body bg-primary/5 p-5 rounded-xl border border-primary/10">
              Have questions, feedback, or partnership inquiries? We'd love to hear from you. Fill out the form or reach out directly, and our team will respond within 24 hours.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail, label: "EMAIL", value: "hello@logicia.ai" },
                { icon: Phone, label: "PHONE", value: "+1 (555) 000-1234" },
                { icon: MapPin, label: "LOCATION", value: "San Francisco, CA" },
              ].map((item, i) => (
                <div 
                  key={item.label} 
                  className="flex items-center gap-4 sm:gap-5 group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:neon-box group-hover:bg-primary/20 transition-all duration-300">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-primary/70 mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/90 font-body tracking-wide group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form - Right */}
          <form 
            onSubmit={handleSubmit} 
            className="glass-strong rounded-2xl p-6 sm:p-8 space-y-5 order-1 md:order-2 border border-primary/20 hover:border-primary/40 transition-colors duration-500 shadow-2xl shadow-black/50"
          >
            {/* Name Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box focus:bg-primary/5 transition-all duration-300 font-body"
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box focus:bg-primary/5 transition-all duration-300 font-body"
              />
            </div>

            {/* Message Textarea */}
            <div className="relative group">
              <div className="absolute top-3.5 left-0 pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <MessageSquare size={16} />
              </div>
              <textarea
                required
                placeholder="How can we help you?"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box focus:bg-primary/5 transition-all duration-300 font-body resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status !== "idle"}
              className={`w-full py-4 border rounded-xl font-display text-[10px] sm:text-xs tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-2.5 group overflow-hidden ${
                status === "success" 
                  ? "bg-primary text-primary-foreground border-primary neon-box-strong cursor-default" 
                  : status === "submitting"
                    ? "bg-primary/20 text-primary border-primary cursor-wait"
                    : "bg-transparent text-primary border-primary/50 hover:bg-primary/10 hover:border-primary hover:neon-box hover:scale-[1.02]"
              }`}
            >
              {getButtonContent()}
              
              {/* Shine effect on hover for idle state */}
              {status === "idle" && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[streak_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
              )}
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;

import { useState } from "react";
import { Send, MapPin, Mail, Phone } from "lucide-react";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="relative z-10 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl text-center font-bold text-primary neon-text mb-4">
          CONTACT
        </h2>
        <p className="text-center text-muted-foreground text-sm font-body tracking-wider mb-16 max-w-xl mx-auto">
          Get in touch with the team
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div className="space-y-8">
            <p className="text-sm text-foreground/80 leading-relaxed font-body">
              Have questions, feedback, or partnership inquiries? We'd love to hear from you. Reach out and our team will respond within 24 hours.
            </p>

            {[
              { icon: Mail, label: "EMAIL", value: "hello@aimathassistant.com" },
              { icon: Phone, label: "PHONE", value: "+1 (555) 000-1234" },
              { icon: MapPin, label: "LOCATION", value: "San Francisco, CA" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-display text-[10px] tracking-[0.2em] text-primary mb-0.5">{item.label}</p>
                  <p className="text-sm text-foreground/70 font-body">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-strong rounded-lg p-6 space-y-5">
            {[
              { name: "name" as const, placeholder: "Your Name", type: "text" },
              { name: "email" as const, placeholder: "Your Email", type: "email" },
            ].map((field) => (
              <input
                key={field.name}
                type={field.type}
                required
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box transition-all duration-300 font-body"
              />
            ))}
            <textarea
              required
              placeholder="Your Message"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-box transition-all duration-300 font-body resize-none"
            />

            <button
              type="submit"
              className="w-full py-3 border border-primary/50 rounded-lg font-display text-xs tracking-[0.3em] text-primary hover:bg-primary/10 hover:neon-box transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {sent ? "MESSAGE SENT ✓" : (
                <>SEND MESSAGE <Send size={14} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

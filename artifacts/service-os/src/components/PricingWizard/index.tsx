import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { QuoteResponse, WizardStep, BillingPeriod } from "./types";
import { QuoteCard } from "./QuoteCard";
import { Sparkles, Loader2, Send } from "lucide-react";

const PAIN_POINT_OPTIONS = [
  { key: "no_gps", label: "Can't track crews" },
  { key: "scheduling_dispatch", label: "Scheduling & dispatch" },
  { key: "chasing_invoices", label: "Chasing invoices" },
  { key: "slow_quoting", label: "Slow quoting & estimates" },
  { key: "referrals", label: "Need more referrals" },
  { key: "collecting_reviews", label: "Collecting reviews" },
  { key: "sms_marketing", label: "SMS & marketing" },
  { key: "tracking_hours", label: "Tracking hours" },
  { key: "tech_updates", label: "Tech feels outdated" },
  { key: "multiple_locations", label: "Multiple locations" },
];

const WIZARD_ADDONS = [
  { key: "gps_tracking", name: "GPS Tracking", description: "Real-time crew locations and route history", price: 5 },
  { key: "landing_page", name: "Landing Pages", description: "Custom booking pages for each service", price: 6 },
  { key: "sms_marketing", name: "SMS Campaigns", description: "Automated text marketing and follow-ups", price: 6 },
  { key: "live_chat", name: "Live Chat", description: "Website chat widget with AI-assisted replies", price: 14 },
  { key: "background_check", name: "Background Checks", description: "Instant employee screening reports", price: 9 },
  { key: "multi_location", name: "Multi-Location", description: "Manage multiple offices or territories", price: 49 },
  { key: "custom_reports", name: "Custom Reports", description: "Build your own dashboards and exports", price: 6 },
  { key: "white_label", name: "White Label", description: "Your branding, your domain, your app", price: 49, isOneTime: true },
];

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

function trackEvent(name: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", name, props);
    }
  } catch {}
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-blue-50 rounded-2xl rounded-tl-sm w-fit max-w-[80%]">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ msg }: { msg: Message }) {
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-1 duration-200",
        msg.role === "ai" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%]",
          msg.role === "ai"
            ? "bg-blue-50 text-foreground rounded-tl-sm"
            : "bg-foreground text-background rounded-tr-sm"
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}

function ChatInput({ placeholder, onSubmit, disabled }: { placeholder: string; onSubmit: (value: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

function ProgressDots({ step }: { step: WizardStep }) {
  const stepNum = step === 3 || step === "processing" || step === "quote" ? 4 : (step as number);
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i < stepNum ? "bg-primary" : stepNum === i ? "bg-primary/40" : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
}

export function PricingWizard() {
  const [step, setStep] = useState<WizardStep>(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [industry, setIndustry] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [billingPeriod] = useState<BillingPeriod>("monthly");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  function addMessage(role: "ai" | "user", text: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, text }]);
  }

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Hi! I'm the ServiceOS assistant. Let me build you a personalised quote in about 60 seconds. First — what type of service business are you running?");
      trackEvent("wizard_started", { industry: null });
      scrollToBottom();
    }, 800);
  }, []);

  async function handleIndustrySelect(ind: string) {
    setIndustry(ind);
    addMessage("user", ind);
    setIsTyping(true);
    trackEvent("wizard_step_completed", { step: 1, value: ind });
    scrollToBottom();
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    addMessage("ai", `Great — ${ind}! How many people are on your team? Include anyone who goes out on jobs.`);
    setStep(1);
    scrollToBottom();
  }

  async function handleTeamSizeSelect(size: string) {
    setTeamSize(size);
    addMessage("user", size);
    setIsTyping(true);
    trackEvent("wizard_step_completed", { step: 2, value: size });
    scrollToBottom();
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    addMessage("ai", "Almost there! What's giving you the most headaches right now? Pick everything that applies.");
    setStep(2);
    scrollToBottom();
  }

  function togglePainPoint(key: string) {
    setPainPoints(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function toggleAddon(key: string) {
    setSelectedAddons(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  async function handlePainPointsSubmit() {
    const labels = PAIN_POINT_OPTIONS.filter(o => painPoints.includes(o.key)).map(o => o.label);
    addMessage("user", labels.join(", "));
    setIsTyping(true);
    trackEvent("wizard_step_completed", { step: 3, value: painPoints.join(",") });
    scrollToBottom();
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    addMessage("ai", "Last step! Would you like to add any extras to your plan? Pick as many as you like, or skip ahead.");
    setStep(3);
    scrollToBottom();
  }

  async function handleAddonsSubmit() {
    if (selectedAddons.length > 0) {
      const addonLabels = WIZARD_ADDONS.filter(a => selectedAddons.includes(a.key)).map(a => a.name);
      addMessage("user", addonLabels.join(", "));
    } else {
      addMessage("user", "No add-ons for now");
    }
    addMessage("ai", "Perfect — let me put your personalised quote together...");
    trackEvent("wizard_step_completed", { step: 4, value: selectedAddons.join(",") });
    setStep("processing");
    setIsTyping(true);
    scrollToBottom();

    const [response] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}api/wizard/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          industry,
          team_size: teamSize,
          pain_points: painPoints,
          selected_addons: selectedAddons,
        }),
      }).then(r => r.json()).catch(() => null),
      new Promise(r => setTimeout(r, 1500)),
    ]);

    setIsTyping(false);
    setQuote(response);
    setStep("quote");
    trackEvent("wizard_quote_viewed", {
      recommended_tier: response?.recommended_tier,
      monthly_total: response?.monthly_base,
      addon_count: response?.suggested_addons?.length ?? 0,
    });
    scrollToBottom();
  }

  function handleStartOver() {
    setStep(0);
    setIndustry(null);
    setTeamSize(null);
    setPainPoints([]);
    setSelectedAddons([]);
    setQuote(null);
    setMessages([]);
    setIsTyping(true);
    hasMounted.current = false;
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Hi! I'm the ServiceOS assistant. Let me build you a personalised quote in about 60 seconds. First — what type of service business are you running?");
      trackEvent("wizard_started", { industry: null });
      scrollToBottom();
    }, 800);
  }

  return (
    <div className="bg-white rounded-3xl border shadow-2xl shadow-black/10 overflow-hidden w-full max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">AI Pricing Assistant</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">by ServiceOS</p>
          </div>
        </div>
        <ProgressDots step={step} />
      </div>

      {/* Chat area */}
      <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-5 pb-5 border-t pt-4">
        {step === 0 && !isTyping && (
          <ChatInput
            placeholder="e.g. Landscaping, HVAC, Plumbing…"
            onSubmit={handleIndustrySelect}
          />
        )}

        {step === 1 && !isTyping && (
          <ChatInput
            placeholder="e.g. Just me, 5, 20 people…"
            onSubmit={handleTeamSizeSelect}
          />
        )}

        {step === 2 && !isTyping && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {PAIN_POINT_OPTIONS.map(option => {
                const isOn = painPoints.includes(option.key);
                return (
                  <button
                    key={option.key}
                    onClick={() => togglePainPoint(option.key)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                      isOn
                        ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/30"
                        : "bg-secondary/30 border-border text-foreground hover:border-primary/40 hover:bg-secondary/50"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {painPoints.length > 0 && (
              <button
                onClick={handlePainPointsSubmit}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all animate-in fade-in duration-200"
              >
                Continue with {painPoints.length} selected
              </button>
            )}
          </div>
        )}

        {step === 3 && !isTyping && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {WIZARD_ADDONS.map(addon => {
                const isOn = selectedAddons.includes(addon.key);
                return (
                  <button
                    key={addon.key}
                    onClick={() => toggleAddon(addon.key)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      isOn
                        ? "bg-primary/5 border-primary ring-1 ring-primary/30"
                        : "bg-secondary/30 border-border hover:border-primary/40 hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                      isOn ? "bg-primary border-primary" : "border-muted-foreground/30"
                    )}>
                      {isOn && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{addon.name}</span>
                        <span className="text-sm font-bold text-foreground shrink-0 ml-2">${addon.price}<span className="text-xs font-normal text-muted-foreground">{addon.isOneTime ? " one-time" : "/mo"}</span></span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleAddonsSubmit}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all animate-in fade-in duration-200"
            >
              {selectedAddons.length > 0
                ? `Build my quote with ${selectedAddons.length} add-on${selectedAddons.length > 1 ? "s" : ""}`
                : "Skip — build my quote"}
            </button>
          </div>
        )}

        {step === "processing" && (
          <div className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Building your personalised quote...
          </div>
        )}

        {step === "quote" && quote && (
          <QuoteCard
            quote={quote}
            sessionId={sessionId}
            onStartOver={handleStartOver}
            initialAddonKeys={selectedAddons}
          />
        )}
      </div>
    </div>
  );
}

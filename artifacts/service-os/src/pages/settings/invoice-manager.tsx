import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Palette, Building2, Plus, Trash2, Send,
  Sparkles, Save, Check, Loader2,
  DollarSign, User, Wand2, AlignLeft, AlignCenter, AlignRight,
  Type, Image as ImageIcon, Upload, X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." },
];

const INVOICE_STYLES = [
  { id: "modern",  label: "Modern",  desc: "Clean lines, bold headers" },
  { id: "classic", label: "Classic", desc: "Traditional, professional" },
  { id: "minimal", label: "Minimal", desc: "Simple, whitespace-first" },
];

const FONT_OPTIONS = [
  { id: "inter",    label: "Inter",      stack: "Inter, system-ui, sans-serif" },
  { id: "georgia",  label: "Georgia",    stack: "Georgia, 'Times New Roman', serif" },
  { id: "mono",     label: "Monospace",  stack: "'Courier New', Courier, monospace" },
  { id: "system",   label: "System",     stack: "system-ui, -apple-system, sans-serif" },
];

const PAYMENT_TERMS = [
  { id: "due_on_receipt", label: "Due on Receipt" },
  { id: "net15",  label: "Net 15" },
  { id: "net30",  label: "Net 30" },
  { id: "net60",  label: "Net 60" },
];

const LOGO_SIZES: Record<string, number> = { sm: 40, md: 64, lg: 96 };

type LineItem = { id: string; description: string; quantity: string; unitPrice: string };

type Template = {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  style: string;
  fontFamily: string;
  logoSize: "sm" | "md" | "lg";
  logoPosition: "left" | "center" | "right";
  companyName: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  taxRate: string;
  paymentTerms: string;
  footerText: string;
};

const DEFAULT_TMPL: Template = {
  logoUrl: "", primaryColor: "#185FA5", accentColor: "#0F3F75",
  style: "modern", fontFamily: "inter", logoSize: "md", logoPosition: "left",
  companyName: "", addressLine1: "", city: "", state: "", zip: "",
  taxRate: "0", paymentTerms: "net30", footerText: "",
};

function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const profileStr = sessionStorage.getItem("mock_profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile?.id) headers["x-clerk-user-id"] = `user_${profile.id}`;
    }
    if (sessionStorage.getItem("is_demo_session") === "true") {
      headers["x-demo-session"] = "true";
    }
  } catch {}
  return fetch(`${import.meta.env.BASE_URL}api${path}`, {
    ...options,
    headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
  });
}

function fmtMoney(val: number) {
  return val.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", quantity: "1", unitPrice: "" };
}

const SAMPLE_ITEMS = [
  { description: "HVAC Inspection & Tune-up", quantity: 1, unitPrice: 180 },
  { description: "Refrigerant Recharge (2 lbs)", quantity: 2, unitPrice: 65 },
  { description: "Filter Replacement", quantity: 1, unitPrice: 35 },
];

function LogoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange((e.target?.result as string) || "");
    reader.readAsDataURL(file);
  }

  function handleFiles(files: FileList | null) {
    if (files && files[0]) readFile(files[0]);
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/40 border rounded-xl">
        <img
          src={value}
          alt="Logo"
          className="h-10 w-auto max-w-[120px] object-contain rounded-lg bg-white p-1 border"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">Logo uploaded</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or SVG</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            title="Replace logo"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChange("")}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Remove logo"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
    );
  }

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        <Upload className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Click or drag to upload</p>
        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, SVG — max 2MB</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

function InvoicePreview({ tmpl }: { tmpl: Template }) {
  const font = FONT_OPTIONS.find(f => f.id === tmpl.fontFamily) || FONT_OPTIONS[0];
  const logoH = LOGO_SIZES[tmpl.logoSize] || 64;
  const subtotal = SAMPLE_ITEMS.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxRate = parseFloat(tmpl.taxRate) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const isModern  = tmpl.style === "modern";
  const isClassic = tmpl.style === "classic";
  const isMinimal = tmpl.style === "minimal";

  const headerBg = isMinimal ? "#fff" : tmpl.primaryColor;
  const headerText = isMinimal ? tmpl.primaryColor : "#fff";

  const logoAlignClass =
    tmpl.logoPosition === "center" ? "items-center text-center" :
    tmpl.logoPosition === "right"  ? "items-end text-right" : "items-start text-left";

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-lg border"
      style={{ fontFamily: font.stack, fontSize: "11px", background: "#fff", color: "#1a1a1a" }}
    >
      {/* Header */}
      <div
        style={{
          background: headerBg,
          color: headerText,
          padding: isMinimal ? "20px 24px 14px" : "20px 24px",
          borderBottom: isMinimal ? `3px solid ${tmpl.primaryColor}` : "none",
        }}
      >
        <div className={cn("flex flex-col gap-2", logoAlignClass)}>
          {tmpl.logoUrl ? (
            <img
              src={tmpl.logoUrl}
              alt="logo"
              style={{ height: logoH, width: "auto", maxWidth: "100%", objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div
              style={{
                height: logoH,
                width: logoH * 2.5,
                background: isMinimal ? tmpl.primaryColor + "18" : "#ffffff30",
                border: `1.5px dashed ${isMinimal ? tmpl.primaryColor + "60" : "#ffffff60"}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isMinimal ? tmpl.primaryColor + "80" : "#ffffff80",
                fontSize: 10,
                gap: 4,
              }}
            >
              <ImageIcon size={14} /> Logo
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: isModern ? 15 : 13, letterSpacing: isModern ? "-0.02em" : 0 }}>
              {tmpl.companyName || "Your Company Name"}
            </div>
            {(tmpl.addressLine1 || tmpl.city) && (
              <div style={{ opacity: 0.85, fontSize: 10, marginTop: 2 }}>
                {[tmpl.addressLine1, [tmpl.city, tmpl.state, tmpl.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Meta */}
      <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: tmpl.primaryColor }}>INVOICE</div>
          <div style={{ color: "#6b7280", marginTop: 4 }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>INV-2026-042</span>
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#6b7280", lineHeight: 1.8 }}>
          <div><span style={{ fontWeight: 600 }}>Date:</span> Mar 15, 2026</div>
          <div><span style={{ fontWeight: 600 }}>Due:</span> Apr 14, 2026</div>
          <div>
            <span style={{ fontWeight: 600 }}>Terms:</span>{" "}
            {PAYMENT_TERMS.find(p => p.id === tmpl.paymentTerms)?.label || "Net 30"}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 40 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 4 }}>
            Bill To
          </div>
          <div style={{ fontWeight: 600, color: "#111827" }}>John Smith</div>
          <div style={{ color: "#6b7280" }}>john.smith@email.com</div>
          <div style={{ color: "#6b7280" }}>456 Oak Ave, Dallas TX 75201</div>
        </div>
      </div>

      {/* Line Items */}
      <div style={{ padding: "0 24px 12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ background: isMinimal ? "#f9fafb" : tmpl.primaryColor + "12", borderBottom: `2px solid ${tmpl.primaryColor}` }}>
              <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: tmpl.primaryColor }}>Description</th>
              <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: tmpl.primaryColor, width: 40 }}>Qty</th>
              <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: tmpl.primaryColor, width: 60 }}>Unit</th>
              <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: tmpl.primaryColor, width: 60 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ITEMS.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 1 && !isMinimal ? "#fafafa" : "#fff" }}>
                <td style={{ padding: "7px 8px", color: "#374151" }}>{item.description}</td>
                <td style={{ padding: "7px 8px", textAlign: "center", color: "#6b7280" }}>{item.quantity}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#6b7280" }}>{fmtMoney(item.unitPrice)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#111827" }}>{fmtMoney(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "#6b7280" }}>
              <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "#6b7280" }}>
                <span>Tax ({taxRate}%)</span><span>{fmtMoney(tax)}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 8px", marginTop: 6, borderRadius: 6,
              background: tmpl.primaryColor,
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>
              <span>Total</span><span>{fmtMoney(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {(tmpl.footerText || true) && (
        <div style={{
          padding: "10px 24px",
          borderTop: `1px solid ${tmpl.primaryColor}30`,
          background: tmpl.primaryColor + "08",
          color: "#9ca3af",
          fontSize: 9,
          textAlign: "center",
        }}>
          {tmpl.footerText || "Thank you for your business!"}
        </div>
      )}
    </div>
  );
}

export default function InvoiceManager() {
  const [activeSection, setActiveSection] = useState<"template" | "create">("template");

  const [tmpl, setTmpl] = useState<Template>(DEFAULT_TMPL);
  const [tmplLoading, setTmplLoading] = useState(true);
  const [tmplSaving, setTmplSaving] = useState(false);
  const [tmplSaved, setTmplSaved] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [invoice, setInvoice] = useState({ customerId: "", dueDate: "", notes: "" });
  const [lineItems, setLineItems] = useState<LineItem[]>([newItem()]);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState("0");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiDesc, setAiDesc] = useState("");
  const [aiJobType, setAiJobType] = useState("");
  const [aiEstimate, setAiEstimate] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/invoice-manager/template")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setTmpl({
          logoUrl:       data.logoUrl       || "",
          primaryColor:  data.primaryColor  || "#185FA5",
          accentColor:   data.accentColor   || "#0F3F75",
          style:         data.style         || "modern",
          fontFamily:    data.fontFamily    || "inter",
          logoSize:      data.logoSize      || "md",
          logoPosition:  data.logoPosition  || "left",
          companyName:   data.companyName   || "",
          addressLine1:  data.addressLine1  || "",
          city:          data.city          || "",
          state:         data.state         || "",
          zip:           data.zip           || "",
          taxRate:       data.taxRate       || "0",
          paymentTerms:  data.paymentTerms  || "net30",
          footerText:    data.footerText    || "",
        });
      })
      .finally(() => setTmplLoading(false));

    apiFetch("/customers?limit=200")
      .then(r => r.ok ? r.json() : { customers: [] })
      .then(data => setCustomers(data.customers || []));
  }, []);

  useEffect(() => { setInvoiceTaxRate(tmpl.taxRate || "0"); }, [tmpl.taxRate]);

  const handleStateChange = useCallback(async (state: string) => {
    setTmpl(t => ({ ...t, state }));
    if (!state) return;
    try {
      const r = await apiFetch(`/invoice-manager/state-tax/${state}`);
      if (r.ok) {
        const data = await r.json();
        setTmpl(t => ({ ...t, taxRate: String(data.taxRate) }));
      }
    } catch {}
  }, []);

  const saveTemplate = async () => {
    setTmplSaving(true);
    try {
      const r = await apiFetch("/invoice-manager/template", {
        method: "PUT",
        body: JSON.stringify(tmpl),
      });
      if (r.ok) { setTmplSaved(true); setTimeout(() => setTmplSaved(false), 2500); }
    } finally { setTmplSaving(false); }
  };

  const addLineItem    = () => setLineItems(prev => [...prev, newItem()]);
  const removeLineItem = (id: string) => setLineItems(prev => prev.filter(i => i.id !== id));
  const updateLineItem = (id: string, field: keyof LineItem, value: string) =>
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const subtotal = lineItems.reduce((sum, item) =>
    sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  const taxAmount = subtotal * (parseFloat(invoiceTaxRate) / 100);
  const total = subtotal + taxAmount;

  const createInvoice = async (sendToCustomer: boolean) => {
    if (!invoice.customerId) return;
    const fn = sendToCustomer ? setSending : setCreating;
    fn(true); setCreateSuccess(null);
    try {
      const r = await apiFetch("/invoice-manager/create-with-items", {
        method: "POST",
        body: JSON.stringify({
          customerId: invoice.customerId,
          dueDate: invoice.dueDate || null,
          notes: invoice.notes || null,
          taxRate: invoiceTaxRate,
          lineItems: lineItems.filter(i => i.description).map(i => ({
            description: i.description,
            quantity: parseFloat(i.quantity) || 1,
            unitPrice: parseFloat(i.unitPrice) || 0,
          })),
        }),
      });
      if (r.ok) {
        const data = await r.json();
        if (sendToCustomer) {
          await apiFetch("/invoice-manager/send-to-customer", {
            method: "POST",
            body: JSON.stringify({ invoiceId: data.invoice.id }),
          });
          setCreateSuccess(`Invoice ${data.invoice.invoiceNumber} sent to customer.`);
        } else {
          setCreateSuccess(`Invoice ${data.invoice.invoiceNumber} saved as draft.`);
        }
        setInvoice({ customerId: "", dueDate: "", notes: "" });
        setLineItems([newItem()]);
      }
    } finally { fn(false); }
  };

  const runAiSuggest = async () => {
    setAiLoading(true); setAiError(null);
    try {
      const r = await apiFetch("/invoice-manager/ai-suggest-items", {
        method: "POST",
        body: JSON.stringify({ serviceDescription: aiDesc, jobType: aiJobType, estimatedValue: aiEstimate }),
      });
      if (r.ok) {
        const data = await r.json();
        const newItems: LineItem[] = (data.items || []).map((item: any) => ({
          id: crypto.randomUUID(),
          description: item.description || "",
          quantity: String(item.quantity || 1),
          unitPrice: String(item.unitPrice || 0),
        }));
        setLineItems(newItems.length > 0 ? newItems : [newItem()]);
        setAiOpen(false); setAiDesc(""); setAiJobType(""); setAiEstimate("");
      } else { setAiError("AI generation failed. Please try again."); }
    } catch { setAiError("Network error. Please try again."); }
    finally { setAiLoading(false); }
  };

  const inputCls = "w-full bg-background border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-muted/50 p-1 rounded-xl w-fit">
        {[
          { id: "template", label: "Invoice Template", icon: Palette },
          { id: "create",   label: "Create an Invoice", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSection === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TEMPLATE TAB ── */}
      {activeSection === "template" && (
        tmplLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">

            {/* ── Controls ── */}
            <div className="space-y-5">

              {/* Brand & Style */}
              <div className="bg-card border rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Brand & Identity</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label>
                    <input
                      type="text"
                      value={tmpl.companyName}
                      onChange={e => setTmpl(t => ({ ...t, companyName: e.target.value }))}
                      placeholder="Your Business Name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Logo</label>
                    <LogoUpload
                      value={tmpl.logoUrl}
                      onChange={url => setTmpl(t => ({ ...t, logoUrl: url }))}
                    />
                  </div>
                </div>

                {/* Logo Size */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> Logo Size
                  </label>
                  <div className="flex gap-2">
                    {(["sm", "md", "lg"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setTmpl(t => ({ ...t, logoSize: s }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                          tmpl.logoSize === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Position */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Logo Position</label>
                  <div className="flex gap-2">
                    {([
                      { id: "left",   icon: AlignLeft   },
                      { id: "center", icon: AlignCenter },
                      { id: "right",  icon: AlignRight  },
                    ] as const).map(({ id, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setTmpl(t => ({ ...t, logoPosition: id }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg border flex items-center justify-center gap-1.5 text-sm font-medium transition-all capitalize",
                          tmpl.logoPosition === id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <Icon className="w-4 h-4" /> {id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Colors & Font */}
              <div className="bg-card border rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Colors & Typography</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tmpl.primaryColor}
                        onChange={e => setTmpl(t => ({ ...t, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={tmpl.primaryColor}
                        onChange={e => setTmpl(t => ({ ...t, primaryColor: e.target.value }))}
                        className={cn(inputCls, "font-mono")}
                        placeholder="#185FA5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tmpl.accentColor}
                        onChange={e => setTmpl(t => ({ ...t, accentColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={tmpl.accentColor}
                        onChange={e => setTmpl(t => ({ ...t, accentColor: e.target.value }))}
                        className={cn(inputCls, "font-mono")}
                        placeholder="#0F3F75"
                      />
                    </div>
                  </div>
                </div>

                {/* Font */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" /> Font Family
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONT_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTmpl(t => ({ ...t, fontFamily: f.id }))}
                        style={{ fontFamily: f.stack }}
                        className={cn(
                          "py-2.5 rounded-lg border text-sm transition-all",
                          tmpl.fontFamily === f.id
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Layout Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {INVOICE_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setTmpl(t => ({ ...t, style: style.id }))}
                        className={cn(
                          "relative p-3 rounded-xl border-2 text-left transition-all",
                          tmpl.style === style.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        )}
                      >
                        {tmpl.style === style.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className="space-y-0.5 mb-2">
                          <div className="h-1.5 rounded bg-current opacity-30 w-full" />
                          <div className="h-1 rounded bg-current opacity-15 w-3/4" />
                          <div className="h-1 rounded bg-current opacity-10 w-1/2" />
                        </div>
                        <p className="font-semibold text-xs text-foreground">{style.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Address & Tax */}
              <div className="bg-card border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Business Address & Tax</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={tmpl.addressLine1}
                    onChange={e => setTmpl(t => ({ ...t, addressLine1: e.target.value }))}
                    placeholder="123 Main St"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                    <input
                      type="text"
                      value={tmpl.city}
                      onChange={e => setTmpl(t => ({ ...t, city: e.target.value }))}
                      placeholder="Austin"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
                    <select
                      value={tmpl.state}
                      onChange={e => handleStateChange(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">— Select —</option>
                      {US_STATES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} – {s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">ZIP</label>
                    <input
                      type="text"
                      value={tmpl.zip}
                      onChange={e => setTmpl(t => ({ ...t, zip: e.target.value }))}
                      placeholder="78701"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Sales Tax Rate</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tmpl.state ? `Auto-calculated for ${tmpl.state} — override below` : "Select a state to auto-fill, or enter manually"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="20" step="0.001"
                      value={tmpl.taxRate}
                      onChange={e => setTmpl(t => ({ ...t, taxRate: e.target.value }))}
                      className="w-20 bg-background border rounded-xl px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Terms & Footer */}
              <div className="bg-card border rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-foreground text-sm">Payment Terms & Footer</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Default Payment Terms</label>
                    <select
                      value={tmpl.paymentTerms}
                      onChange={e => setTmpl(t => ({ ...t, paymentTerms: e.target.value }))}
                      className={inputCls}
                    >
                      {PAYMENT_TERMS.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Footer Text</label>
                    <input
                      type="text"
                      value={tmpl.footerText}
                      onChange={e => setTmpl(t => ({ ...t, footerText: e.target.value }))}
                      placeholder="Thank you for your business!"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pb-2">
                <button
                  onClick={saveTemplate}
                  disabled={tmplSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {tmplSaved ? <Check className="w-4 h-4" /> : tmplSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {tmplSaved ? "Saved!" : "Save Template"}
                </button>
              </div>
            </div>

            {/* ── Live Preview ── */}
            <div className="xl:sticky xl:top-6">
              <div className="bg-muted/30 border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sample data</span>
                </div>
                <div className="overflow-hidden rounded-xl shadow-sm">
                  <InvoicePreview tmpl={tmpl} />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Changes reflect instantly · Sample line items shown
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── CREATE TAB ── */}
      {activeSection === "create" && (
        <div className="space-y-5 max-w-3xl">
          {createSuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
              <Check className="w-5 h-5 shrink-0" />
              <p className="font-medium text-sm">{createSuccess}</p>
            </div>
          )}

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Invoice Details</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Customer *</label>
                <select
                  value={invoice.customerId}
                  onChange={e => setInvoice(i => ({ ...i, customerId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">— Select customer —</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={e => setInvoice(i => ({ ...i, dueDate: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Notes / Instructions</label>
              <textarea
                value={invoice.notes}
                onChange={e => setInvoice(i => ({ ...i, notes: e.target.value }))}
                placeholder="Payment instructions, warranty notes, etc."
                rows={2}
                className={cn(inputCls, "resize-none")}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Line Items</h3>
              </div>
              <button
                onClick={() => setAiOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                AI Suggest
              </button>
            </div>

            {aiOpen && (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Line Item Generator
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    type="text" placeholder="Service description"
                    value={aiDesc}
                    onChange={e => setAiDesc(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text" placeholder="Job type (HVAC, plumbing…)"
                    value={aiJobType}
                    onChange={e => setAiJobType(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text" placeholder="Est. value ($)"
                    value={aiEstimate}
                    onChange={e => setAiEstimate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                {aiError && <p className="text-xs text-red-500">{aiError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={runAiSuggest}
                    disabled={aiLoading || !aiDesc}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Generate Items
                  </button>
                  <button onClick={() => setAiOpen(false)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_70px_90px_36px] gap-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Qty</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Unit Price</span>
                <span />
              </div>
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_70px_90px_36px] gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateLineItem(item.id, "description", e.target.value)}
                    placeholder="Service or part description"
                    className={inputCls}
                  />
                  <input
                    type="number" min="0" step="1"
                    value={item.quantity}
                    onChange={e => updateLineItem(item.id, "quantity", e.target.value)}
                    className={cn(inputCls, "text-center")}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateLineItem(item.id, "unitPrice", e.target.value)}
                      placeholder="0.00"
                      className={cn(inputCls, "pl-6 text-right")}
                    />
                  </div>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addLineItem}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1"
              >
                <Plus className="w-4 h-4" /> Add line item
              </button>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 flex justify-end">
              <div className="space-y-1.5 min-w-[200px]">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground gap-3">
                  <span className="flex items-center gap-1.5">
                    Tax
                    <input
                      type="number" min="0" max="20" step="0.001"
                      value={invoiceTaxRate}
                      onChange={e => setInvoiceTaxRate(e.target.value)}
                      className="w-14 text-right bg-background border rounded-lg px-2 py-0.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    %
                  </span>
                  <span>{fmtMoney(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground border-t pt-2">
                  <span>Total</span><span>{fmtMoney(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => createInvoice(false)}
              disabled={creating || !invoice.customerId}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 disabled:opacity-50 transition-all"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Save Draft
            </button>
            <button
              onClick={() => createInvoice(true)}
              disabled={sending || !invoice.customerId}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send to Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

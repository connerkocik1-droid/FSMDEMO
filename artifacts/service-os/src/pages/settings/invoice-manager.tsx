import { useState, useEffect, useCallback } from "react";
import {
  FileText, Palette, Building2, Plus, Trash2, Send,
  Sparkles, Save, ChevronDown, ChevronUp, Check, Loader2,
  DollarSign, User, Calendar, Hash, Wand2
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
  { id: "modern", label: "Modern", desc: "Clean lines, bold headers" },
  { id: "classic", label: "Classic", desc: "Traditional, professional" },
  { id: "minimal", label: "Minimal", desc: "Simple, whitespace-first" },
];

const PAYMENT_TERMS = [
  { id: "due_on_receipt", label: "Due on Receipt" },
  { id: "net15", label: "Net 15" },
  { id: "net30", label: "Net 30" },
  { id: "net60", label: "Net 60" },
];

type LineItem = { id: string; description: string; quantity: string; unitPrice: string };

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

export default function InvoiceManager() {
  const [activeSection, setActiveSection] = useState<"template" | "create">("template");

  const [tmpl, setTmpl] = useState({
    logoUrl: "", primaryColor: "#185FA5", accentColor: "#0F3F75",
    style: "modern", companyName: "", addressLine1: "",
    city: "", state: "", zip: "", taxRate: "0",
    paymentTerms: "net30", footerText: "",
  });
  const [tmplLoading, setTmplLoading] = useState(true);
  const [tmplSaving, setTmplSaving] = useState(false);
  const [tmplSaved, setTmplSaved] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [invoice, setInvoice] = useState({
    customerId: "", dueDate: "", notes: "",
  });
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
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#185FA5",
          accentColor: data.accentColor || "#0F3F75",
          style: data.style || "modern",
          companyName: data.companyName || "",
          addressLine1: data.addressLine1 || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          taxRate: data.taxRate || "0",
          paymentTerms: data.paymentTerms || "net30",
          footerText: data.footerText || "",
        });
      })
      .finally(() => setTmplLoading(false));

    apiFetch("/customers?limit=200")
      .then(r => r.ok ? r.json() : { customers: [] })
      .then(data => setCustomers(data.customers || []));
  }, []);

  useEffect(() => {
    setInvoiceTaxRate(tmpl.taxRate || "0");
  }, [tmpl.taxRate]);

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
      if (r.ok) {
        setTmplSaved(true);
        setTimeout(() => setTmplSaved(false), 2500);
      }
    } finally {
      setTmplSaving(false);
    }
  };

  const addLineItem = () => setLineItems(prev => [...prev, newItem()]);
  const removeLineItem = (id: string) => setLineItems(prev => prev.filter(i => i.id !== id));
  const updateLineItem = (id: string, field: keyof LineItem, value: string) =>
    setLineItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  }, 0);
  const taxAmount = subtotal * (parseFloat(invoiceTaxRate) / 100);
  const total = subtotal + taxAmount;

  const createInvoice = async (sendToCustomer: boolean) => {
    if (!invoice.customerId) return;
    const fn = sendToCustomer ? setSending : setCreating;
    fn(true);
    setCreateSuccess(null);
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
    } finally {
      fn(false);
    }
  };

  const runAiSuggest = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const r = await apiFetch("/invoice-manager/ai-suggest-items", {
        method: "POST",
        body: JSON.stringify({
          serviceDescription: aiDesc,
          jobType: aiJobType,
          estimatedValue: aiEstimate,
        }),
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
        setAiOpen(false);
        setAiDesc(""); setAiJobType(""); setAiEstimate("");
      } else {
        setAiError("AI generation failed. Please try again.");
      }
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const inputCls = "w-full bg-background border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6 mt-10">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Invoice Manager</h2>
        <p className="text-muted-foreground mt-1">Create professional invoices and manage your billing template.</p>
      </div>

      <div className="flex gap-2 bg-muted/50 p-1 rounded-xl w-fit">
        {[
          { id: "template", label: "Invoice Template", icon: Palette },
          { id: "create", label: "Create an Invoice", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeSection === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === "template" && (
        <div className="space-y-6">
          {tmplLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="bg-card border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Brand & Style</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Logo URL</label>
                    <input
                      type="url"
                      value={tmpl.logoUrl}
                      onChange={e => setTmpl(t => ({ ...t, logoUrl: e.target.value }))}
                      placeholder="https://your-domain.com/logo.png"
                      className={inputCls}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Paste a public image URL (PNG, JPG, SVG)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Company Name on Invoice</label>
                    <input
                      type="text"
                      value={tmpl.companyName}
                      onChange={e => setTmpl(t => ({ ...t, companyName: e.target.value }))}
                      placeholder="Your Business Name"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={tmpl.primaryColor}
                        onChange={e => setTmpl(t => ({ ...t, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
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
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={tmpl.accentColor}
                        onChange={e => setTmpl(t => ({ ...t, accentColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
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

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Invoice Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {INVOICE_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setTmpl(t => ({ ...t, style: style.id }))}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          tmpl.style === style.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        {tmpl.style === style.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="space-y-1 mb-3">
                          <div className="h-1.5 rounded bg-current opacity-30 w-full" />
                          <div className="h-1 rounded bg-current opacity-15 w-3/4" />
                          <div className="h-1 rounded bg-current opacity-10 w-1/2" />
                        </div>
                        <p className="font-semibold text-sm text-foreground">{style.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Business Address & Tax</h3>
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
                      {tmpl.state
                        ? `Auto-calculated for ${tmpl.state} — you can override below`
                        : "Select a state to auto-populate, or enter manually"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.001"
                      value={tmpl.taxRate}
                      onChange={e => setTmpl(t => ({ ...t, taxRate: e.target.value }))}
                      className="w-20 bg-background border rounded-xl px-3 py-2 text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Payment Terms & Footer</h3>
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
                    <label className="block text-sm font-medium text-foreground mb-1.5">Invoice Footer Text</label>
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

              <div className="flex justify-end">
                <button
                  onClick={saveTemplate}
                  disabled={tmplSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-all"
                >
                  {tmplSaved ? <Check className="w-4 h-4" /> : tmplSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {tmplSaved ? "Saved!" : "Save Template"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeSection === "create" && (
        <div className="space-y-5">
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
              <textarea
                value={invoice.notes}
                onChange={e => setInvoice(i => ({ ...i, notes: e.target.value }))}
                placeholder="Add any notes or instructions for the customer..."
                rows={2}
                className={cn(inputCls, "resize-none")}
              />
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Line Items</h3>
              </div>
              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 rounded-lg text-sm font-medium transition-all"
              >
                <Wand2 className="w-4 h-4" />
                AI Generate
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <div className="col-span-6 text-xs font-medium text-muted-foreground">Description</div>
                <div className="col-span-2 text-xs font-medium text-muted-foreground text-right">Qty</div>
                <div className="col-span-3 text-xs font-medium text-muted-foreground text-right">Unit Price</div>
                <div className="col-span-1" />
              </div>

              {lineItems.map((item, idx) => {
                const amt = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/30 rounded-xl p-2">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateLineItem(item.id, "description", e.target.value)}
                        placeholder={`Service or item ${idx + 1}`}
                        className="w-full bg-background border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateLineItem(item.id, "quantity", e.target.value)}
                        min="0"
                        step="0.5"
                        className="w-full bg-background border rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => updateLineItem(item.id, "unitPrice", e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-background border rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {amt > 0 && (
                      <div className="col-span-12 px-1 -mt-1">
                        <p className="text-xs text-muted-foreground text-right">{fmtMoney(amt)}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={addLineItem}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors mt-1"
              >
                <Plus className="w-4 h-4" /> Add line item
              </button>
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">{fmtMoney(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={invoiceTaxRate}
                      onChange={e => setInvoiceTaxRate(e.target.value)}
                      min="0"
                      max="20"
                      step="0.001"
                      className="w-16 bg-background border rounded-lg px-2 py-0.5 text-xs text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <span className="text-sm font-medium">{fmtMoney(taxAmount)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{fmtMoney(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => createInvoice(false)}
              disabled={!invoice.customerId || creating || sending}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-primary text-primary hover:bg-primary/5 font-semibold rounded-xl disabled:opacity-50 transition-all"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </button>
            <button
              onClick={() => createInvoice(true)}
              disabled={!invoice.customerId || creating || sending}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send to Customer
            </button>
          </div>
        </div>
      )}

      {aiOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">AI Invoice Generator</h3>
                  <p className="text-sm text-muted-foreground">Describe the job and AI will suggest line items</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Service Description *</label>
                  <textarea
                    value={aiDesc}
                    onChange={e => setAiDesc(e.target.value)}
                    placeholder="e.g. Replaced HVAC unit, cleaned ducts, installed new thermostat..."
                    rows={3}
                    className={cn(inputCls, "resize-none")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Job Type</label>
                    <input
                      type="text"
                      value={aiJobType}
                      onChange={e => setAiJobType(e.target.value)}
                      placeholder="HVAC, Plumbing, Lawn..."
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Estimated Value</label>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        value={aiEstimate}
                        onChange={e => setAiEstimate(e.target.value)}
                        placeholder="850"
                        className={cn(inputCls, "flex-1")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {aiError && (
                <p className="mt-3 text-sm text-destructive">{aiError}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setAiOpen(false); setAiError(null); }}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={runAiSuggest}
                  disabled={!aiDesc.trim() || aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? "Generating..." : "Generate Items"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

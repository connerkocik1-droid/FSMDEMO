import { useState } from "react";
import { Building2, Save, Palette, Globe, Clock, DollarSign } from "lucide-react";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu",
];

const CURRENCIES = ["USD", "CAD", "GBP", "EUR", "AUD"];
const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

const INDUSTRIES = [
  "Landscaping", "HVAC", "Roofing", "Pest Control", "Plumbing",
  "Electrical", "Cleaning", "Moving", "General Contracting", "Other",
];

export default function CompanySettings() {
  const [company, setCompany] = useState({
    name: "Lee HVAC Services",
    businessType: "HVAC",
    phone: "(555) 123-4567",
    email: "office@leehvac.com",
    address: "456 Service Blvd",
    city: "Austin",
    state: "TX",
    zip: "78701",
    logoUrl: "",
    website: "https://leehvac.com",
  });

  const [settings, setSettings] = useState({
    timezone: "America/Chicago",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    brandColor: "#2563eb",
    notificationPrefs: {
      emailNotifications: true,
      smsNotifications: true,
      jobAlerts: true,
      reviewAlerts: true,
      invoiceAlerts: true,
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Company Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your company information and settings.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Business Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Company Name</label>
              <input
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Industry</label>
              <select
                value={company.businessType}
                onChange={(e) => setCompany({ ...company, businessType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
              >
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                <input
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
              <input
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                <input
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
                <input
                  value={company.state}
                  onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">ZIP</label>
                <input
                  value={company.zip}
                  onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
              <input
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Branding</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Company Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <button className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm font-medium hover:bg-secondary/80">
                    Upload Logo
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  value={settings.brandColor}
                  onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                  className="w-32 px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 font-mono text-sm"
                  placeholder="#2563eb"
                />
                <div className="flex-1 h-10 rounded-xl" style={{ backgroundColor: settings.brandColor }} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Regional Settings</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                >
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notification Preferences</h3>
            </div>

            {Object.entries(settings.notificationPrefs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notificationPrefs: {
                        ...settings.notificationPrefs,
                        [key]: !val,
                      },
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${val ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

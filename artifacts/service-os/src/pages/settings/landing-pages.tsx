import { useState } from "react";
import { Globe, Plus, Eye, Edit, Copy, Trash2, ExternalLink, CheckCircle } from "lucide-react";

const MOCK_PAGES = [
  { id: 1, name: "Main Landing Page", slug: "main", status: "published", views: 1240, conversions: 38, lastUpdated: "2 days ago" },
  { id: 2, name: "HVAC Services", slug: "hvac", status: "draft", views: 0, conversions: 0, lastUpdated: "1 week ago" },
];

export default function LandingPages() {
  const [pages] = useState(MOCK_PAGES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Landing Pages</h2>
          <p className="text-muted-foreground mt-1">Create and manage custom landing pages for your business.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>

      <div className="grid gap-4">
        {pages.map(page => (
          <div key={page.id} className="bg-card border rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{page.name}</p>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{page.views}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{page.conversions}</p>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${page.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {page.status}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"><Edit className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

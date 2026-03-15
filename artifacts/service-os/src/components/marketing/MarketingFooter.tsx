import { Link } from "wouter";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "AI Dispatch", href: "/features/ai-dispatch" },
      { label: "GPS Tracking", href: "/features/gps-tracking" },
      { label: "Invoicing", href: "/features/invoicing" },
      { label: "Scheduling", href: "/features/scheduling" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "HVAC", href: "/industries/hvac" },
      { label: "Plumbing", href: "/industries/plumbing" },
      { label: "Electrical", href: "/industries/electrical" },
      { label: "Landscaping", href: "/industries/landscaping" },
      { label: "Pest Control", href: "/industries/pest-control" },
      { label: "Cleaning", href: "/industries/cleaning" },
      { label: "Roofing", href: "/industries/roofing" },
      { label: "Moving", href: "/industries/moving" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Jobber", href: "/compare/jobber" },
      { label: "vs Housecall Pro", href: "/compare/housecall-pro" },
      { label: "vs ServiceTitan", href: "/compare/servicetitan" },
      { label: "vs FieldPulse", href: "/compare/fieldpulse" },
      { label: "vs GorillaDesk", href: "/compare/gorilladesk" },
      { label: "vs Workiz", href: "/compare/workiz" },
      { label: "vs ServiceM8", href: "/compare/servicem8" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/demo" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-sidebar border-t border-sidebar-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-sidebar-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-sidebar-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sidebar-foreground/60 text-sm">
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="ServiceOS"
              className="w-6 h-6 rounded grayscale"
            />
            <span className="font-display font-semibold">
              ServiceOS &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-sidebar-foreground/60">
            <Link href="/privacy" className="hover:text-sidebar-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-sidebar-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

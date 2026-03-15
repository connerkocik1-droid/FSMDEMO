import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";

const FEATURE_LINKS = [
  { label: "AI Dispatch", href: "/features/ai-dispatch" },
  { label: "GPS Tracking", href: "/features/gps-tracking" },
  { label: "Invoicing", href: "/features/invoicing" },
  { label: "Scheduling", href: "/features/scheduling" },
  { label: "Referrals", href: "/features/referrals" },
  { label: "CRM", href: "/features/crm" },
  { label: "Quotes", href: "/features/quotes" },
];

const INDUSTRY_LINKS = [
  { label: "HVAC", href: "/industries/hvac" },
  { label: "Plumbing", href: "/industries/plumbing" },
  { label: "Electrical", href: "/industries/electrical" },
  { label: "Landscaping", href: "/industries/landscaping" },
  { label: "Pest Control", href: "/industries/pest-control" },
  { label: "Cleaning", href: "/industries/cleaning" },
  { label: "Roofing", href: "/industries/roofing" },
  { label: "Moving", href: "/industries/moving" },
];

const COMPARE_LINKS = [
  { label: "vs Jobber", href: "/compare/jobber" },
  { label: "vs Housecall Pro", href: "/compare/housecall-pro" },
  { label: "vs ServiceTitan", href: "/compare/servicetitan" },
  { label: "vs FieldPulse", href: "/compare/fieldpulse" },
  { label: "vs GorillaDesk", href: "/compare/gorilladesk" },
  { label: "vs Workiz", href: "/compare/workiz" },
  { label: "vs ServiceM8", href: "/compare/servicem8" },
];

interface DropdownProps {
  label: string;
  links: { label: string; href: string }[];
  open: string | null;
  setOpen: (v: string | null) => void;
  id: string;
}

function NavDropdown({ label, links, open, setOpen, id }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (open === id) setOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, id, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(open === id ? null : id)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open === id && "rotate-180")} />
      </button>
      {open === id && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-card border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              onClick={() => setOpen(null)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdown(null);
  }, [location]);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}images/logo.png`}
            alt="ServiceOS Logo"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            ServiceOS
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-muted-foreground">
          <NavDropdown label="Features" links={[{ label: "All Features", href: "/features" }, ...FEATURE_LINKS]} open={dropdown} setOpen={setDropdown} id="features" />
          <NavDropdown label="Industries" links={INDUSTRY_LINKS} open={dropdown} setOpen={setDropdown} id="industries" />
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <NavDropdown label="Compare" links={COMPARE_LINKS} open={dropdown} setOpen={setDropdown} id="compare" />
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/demo"
            className="px-5 py-2.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Book a Demo
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 text-sm"
          >
            Start Free
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-background border-b shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            <MobileSection title="Features" links={[{ label: "All Features", href: "/features" }, ...FEATURE_LINKS]} />
            <MobileSection title="Industries" links={INDUSTRY_LINKS} />
            <Link href="/pricing" className="block text-foreground font-medium py-2">Pricing</Link>
            <MobileSection title="Compare" links={COMPARE_LINKS} />
            <Link href="/blog" className="block text-foreground font-medium py-2">Blog</Link>
            <div className="pt-4 border-t flex flex-col gap-3">
              <Link
                href="/demo"
                className="w-full py-3 text-center font-semibold text-primary border border-primary rounded-xl"
              >
                Book a Demo
              </Link>
              <Link
                href="/login"
                className="w-full py-3 text-center bg-primary text-primary-foreground font-semibold rounded-xl"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-foreground font-medium py-2"
      >
        {title}
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pl-4 space-y-1 mt-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

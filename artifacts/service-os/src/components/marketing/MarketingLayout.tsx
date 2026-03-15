import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

import type { PricingRow } from "./comparison-data";

export function PricingComparisonTable({
  rows,
  competitorName,
}: {
  rows: PricingRow[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-primary/20">
            <th className="text-left px-4 py-4 font-display font-bold text-foreground">
              Team Size
            </th>
            <th className="text-center px-4 py-4 font-display font-bold text-primary">
              ServiceOS
            </th>
            <th className="text-center px-4 py-4 font-display font-bold text-muted-foreground">
              {competitorName}
            </th>
            <th className="text-center px-4 py-4 font-display font-bold text-emerald-600">
              Annual Savings
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const annualSavings = (row.competitor - row.serviceOS) * 12;
            return (
              <tr key={i} className="border-b border-border/50">
                <td className="px-4 py-4 text-sm font-medium text-foreground">
                  {row.techs} technicians
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-lg font-bold text-primary">
                    ${row.serviceOS}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-lg font-bold text-muted-foreground">
                    ${row.competitor.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    Save ${annualSavings.toLocaleString()}/yr
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

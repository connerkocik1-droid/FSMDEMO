import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureRow, FeatureStatus } from "./comparison-data";

function StatusCell({
  status,
  note,
}: {
  status: FeatureStatus;
  note?: string;
}) {
  const icons: Record<FeatureStatus, React.ReactNode> = {
    green: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    amber: <AlertCircle className="w-5 h-5 text-amber-500" />,
    red: <XCircle className="w-5 h-5 text-red-500" />,
  };

  const bgColors: Record<FeatureStatus, string> = {
    green: "bg-emerald-50 dark:bg-emerald-950/20",
    amber: "bg-amber-50 dark:bg-amber-950/20",
    red: "bg-red-50 dark:bg-red-950/20",
  };

  return (
    <td className={cn("px-4 py-3 text-center", bgColors[status])}>
      <div className="flex flex-col items-center gap-1">
        {icons[status]}
        {note && (
          <span className="text-xs text-muted-foreground leading-tight">
            {note}
          </span>
        )}
      </div>
    </td>
  );
}

export function FeatureComparisonTable({
  rows,
  competitorName,
}: {
  rows: FeatureRow[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-primary/20">
            <th className="text-left px-4 py-4 font-display font-bold text-foreground">
              Feature
            </th>
            <th className="text-center px-4 py-4 font-display font-bold text-primary w-40">
              ServiceOS
            </th>
            <th className="text-center px-4 py-4 font-display font-bold text-muted-foreground w-40">
              {competitorName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                {row.feature}
              </td>
              <StatusCell status={row.serviceOS} note={row.serviceOSNote} />
              <StatusCell
                status={row.competitor}
                note={row.competitorNote}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

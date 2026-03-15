import { useGetAnalyticsInsights } from "@workspace/api-client-react";
import type { InsightItem } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  DollarSign,
  Briefcase,
  Users,
  Star,
  Target,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Revenue: DollarSign,
  Collections: Clock,
  Operations: Briefcase,
  Growth: Target,
  Reputation: Star,
  default: Sparkles,
};

const TYPE_STYLES: Record<InsightItem["type"], { bg: string; border: string; badge: string; icon: React.ElementType; iconColor: string }> = {
  positive: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    icon: TrendingUp,
    iconColor: "text-green-500",
  },
  negative: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    icon: TrendingDown,
    iconColor: "text-red-500",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  neutral: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    icon: CheckCircle2,
    iconColor: "text-blue-500",
  },
};

function InsightCard({ insight }: { insight: InsightItem }) {
  const styles = TYPE_STYLES[insight.type];
  const TrendIcon = styles.icon;
  const CategoryIcon = CATEGORY_ICONS[insight.category] || CATEGORY_ICONS.default;

  return (
    <div className={`rounded-2xl border p-6 ${styles.bg} ${styles.border} flex flex-col gap-4 hover:shadow-md transition-all group`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-sm`}>
          <CategoryIcon className={`w-6 h-6 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
              {insight.category}
            </span>
          </div>
          <h3 className="font-bold text-foreground text-base leading-snug">{insight.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-foreground">{insight.value}</p>
          <div className={`flex items-center justify-end gap-1 mt-0.5 text-xs font-semibold ${styles.iconColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{insight.trend}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>

      <div className="pt-2 border-t border-border/50">
        <Link
          href={insight.actionPath}
          className={`inline-flex items-center gap-2 text-sm font-semibold ${styles.iconColor} hover:gap-3 transition-all`}
        >
          {insight.action}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary rounded w-20" />
          <div className="h-5 bg-secondary rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-7 bg-secondary rounded w-16" />
          <div className="h-3 bg-secondary rounded w-12" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-secondary rounded w-full" />
        <div className="h-3 bg-secondary rounded w-4/5" />
      </div>
    </div>
  );
}

export default function Insights() {
  const { data, isLoading, refetch, isFetching } = useGetAnalyticsInsights();

  const positiveInsights = data?.insights.filter(i => i.type === "positive") || [];
  const attentionInsights = data?.insights.filter(i => i.type === "warning" || i.type === "negative") || [];
  const neutralInsights = data?.insights.filter(i => i.type === "neutral") || [];

  const summaryCards = [
    { label: "Things going well", count: positiveInsights.length, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Need attention", count: attentionInsights.length, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Watch & monitor", count: neutralInsights.length, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Insights</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of your business performance and recommendations.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!isLoading && data && (
        <div className="grid grid-cols-3 gap-4">
          {summaryCards.map(card => (
            <div key={card.label} className="bg-card rounded-2xl border p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Sparkles className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className={`text-3xl font-bold font-display ${card.color}`}>{card.count}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => <InsightSkeleton key={i} />)}
        </div>
      ) : !data?.insights.length ? (
        <div className="bg-card rounded-2xl border p-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">No insights yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            As you add customers, jobs, and invoices, insights will appear here based on your business activity.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {positiveInsights.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                What's working well
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {positiveInsights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {attentionInsights.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Needs your attention
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {attentionInsights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {neutralInsights.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Opportunities to monitor
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {neutralInsights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {data?.generatedAt && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated {format(new Date(data.generatedAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      )}
    </div>
  );
}

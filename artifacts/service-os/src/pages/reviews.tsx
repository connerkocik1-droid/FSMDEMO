import { useState } from "react";
import { useListReviews } from "@workspace/api-client-react";
import { Star, Search, Filter, Eye, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function Reviews() {
  const { data, isLoading } = useListReviews();
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");

  const reviews = data?.reviews || [];
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const positive = reviews.filter(r => r.rating >= 4).length;
  const negative = reviews.filter(r => r.rating <= 3).length;

  const filtered = filter === "all" ? reviews :
    filter === "positive" ? reviews.filter(r => r.rating >= 4) :
    reviews.filter(r => r.rating <= 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Reviews & Ratings</h2>
          <p className="text-muted-foreground mt-1">Monitor customer feedback and manage testimonials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{avgRating}</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{positive}</p>
            <p className="text-sm text-muted-foreground">Positive (4-5★)</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ThumbsDown className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{negative}</p>
            <p className="text-sm text-muted-foreground">Needs Attention (1-3★)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "positive", "negative"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {f === "all" ? "All Reviews" : f === "positive" ? "Positive (4-5★)" : "Needs Attention (1-3★)"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-foreground">No reviews yet</p>
            <p className="text-sm mt-1">Reviews will appear here after customers rate their service.</p>
          </div>
        ) : filtered.map(review => (
          <div key={review.id} className="bg-card border rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {review.customer ? `${review.customer.firstName?.[0]}${review.customer.lastName?.[0]}` : "??"}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{review.customer ? `${review.customer.firstName} ${review.customer.lastName}` : "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
                ))}
              </div>
            </div>
            {review.comment && <p className="mt-4 text-sm text-foreground leading-relaxed">{review.comment}</p>}
            {review.isPublic && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Public Testimonial</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

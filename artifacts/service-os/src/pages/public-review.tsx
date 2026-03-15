import { useState } from "react";
import { useRoute } from "wouter";
import { useGetReviewByToken, useSubmitReviewByToken } from "@workspace/api-client-react";
import { Star, CheckCircle2, Heart, MessageSquare } from "lucide-react";

export default function PublicReview() {
  const [, params] = useRoute("/review/:token");
  const token = params?.token || "";
  const { data, isLoading, error } = useGetReviewByToken(token);
  const submitMutation = useSubmitReviewByToken();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ isPositive?: boolean; message?: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😞</span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Review Link Not Found</h2>
          <p className="text-muted-foreground mt-2">This review link may have expired or been used already.</p>
        </div>
      </div>
    );
  }

  if (data.alreadySubmitted || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">
            {submitResult?.isPositive ? "Thank You!" : "Feedback Received"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {submitResult?.message || data.message || "Your review has been submitted. Thank you for your feedback!"}
          </p>
          {submitResult?.isPositive && (
            <div className="mt-6 p-4 bg-primary/5 rounded-2xl">
              <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-medium">Your positive review helps us grow our business!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      const result = await submitMutation.mutateAsync({
        token,
        data: { rating, comment: comment || undefined, testimonial: testimonial || undefined },
      });
      setSubmitResult(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const isPositiveRating = rating >= 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-3xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">Rate Your Experience</h2>
          {data.companyName && (
            <p className="text-muted-foreground mt-1">How was your service with <strong>{data.companyName}</strong>?</p>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredStar || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                {isPositiveRating ? "Tell us what you loved!" : "How can we improve?"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isPositiveRating ? "The crew was amazing..." : "I wish the service had..."}
                className="w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={3}
              />
            </div>

            {isPositiveRating && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <label className="block text-sm font-medium text-green-800 mb-1.5">
                  <Heart className="w-4 h-4 inline mr-1" />
                  Would you share a testimonial we can use?
                </label>
                <textarea
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="I'd recommend this company to anyone who needs..."
                  className="w-full px-4 py-3 border border-green-200 rounded-xl bg-white text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-300/50 resize-none"
                  rows={3}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

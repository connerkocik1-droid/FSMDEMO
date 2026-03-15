import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight, Calendar, Tag, ChevronLeft, ChevronRight, Mail, BookOpen } from "lucide-react";

const API_BASE = `${import.meta.env.BASE_URL}api/blog`;

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "dispatching", label: "Dispatching" },
  { key: "invoicing", label: "Invoicing" },
  { key: "growth", label: "Growth" },
  { key: "industry-guides", label: "Industry Guides" },
  { key: "comparisons", label: "Comparisons" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function categoryLabel(key: string) {
  const cat = CATEGORIES.find(c => c.key === key);
  return cat ? cat.label : key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function EmailCapture({ source = "blog-banner" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/email/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.message === "already_subscribed") {
        setMessage("You're already subscribed!");
      } else {
        setMessage("Thanks for subscribing!");
      }
      setEmail("");
    },
    onError: () => setMessage("Something went wrong. Please try again."),
  });

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-12 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
        <Mail className="w-4 h-4" />
        Newsletter
      </div>
      <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
        Get field service insights delivered weekly
      </h3>
      <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
        Join thousands of service business owners who get actionable tips, industry insights, and growth strategies every week.
      </p>
      {message ? (
        <p className="text-primary font-semibold">{message}</p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); subscribe.mutate(email); }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            {subscribe.isPending ? "..." : "Subscribe"}
          </button>
        </form>
      )}
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {post.coverImage && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}${post.coverImage.replace(/^\//, "")}`}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {categoryLabel(post.category)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {post.readingTime} min read
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {post.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedPost({ post }: { post: any }) {
  if (!post) return null;

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="grid md:grid-cols-2 gap-0">
          {post.coverImage && (
            <div className="aspect-video md:aspect-auto bg-muted overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}${post.coverImage.replace(/^\//, "")}`}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                Featured
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {categoryLabel(post.category)}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-3">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {post.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogList() {
  const [, setLocation] = useLocation();
  const [matchCategory, params] = useRoute("/blog/:category");
  const categoryParam = matchCategory ? params.category : "all";

  const validCategory = CATEGORIES.some(c => c.key === categoryParam);
  const activeCategory = validCategory ? categoryParam : "all";

  const [page, setPage] = useState(1);

  const { data: featuredData } = useQuery({
    queryKey: ["blog", "featured"],
    queryFn: () => fetch(`${API_BASE}/posts/featured`).then(r => r.json()),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "posts", activeCategory, page],
    queryFn: () =>
      fetch(`${API_BASE}/posts?category=${activeCategory}&page=${page}&limit=12`).then(r => r.json()),
  });

  const seoTitle = activeCategory === "all"
    ? "ServiceOS Blog — Tips & Guides for Service Businesses"
    : `${categoryLabel(activeCategory)} — ServiceOS Blog`;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 inset-x-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">ServiceOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="text-foreground font-semibold">Blog</Link>
          </div>
          <Link href="/login" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 text-sm">
            Sign In
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            {activeCategory === "all" ? "Insights for Service Businesses" : categoryLabel(activeCategory)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical tips, industry guides, and growth strategies to help your service business thrive.
          </p>
        </div>

        <title>{seoTitle}</title>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => {
                setPage(1);
                if (cat.key === "all") setLocation("/blog");
                else setLocation(`/blog/${cat.key}`);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {activeCategory === "all" && page === 1 && featuredData?.post && (
          <div className="mb-12">
            <FeaturedPost post={featuredData.post} />
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.posts?.map((post: any) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            {data?.posts?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No posts found in this category yet.</p>
              </div>
            )}

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-20">
          <EmailCapture source="blog-list" />
        </div>
      </div>
    </div>
  );
}

export { EmailCapture, formatDate, categoryLabel, CATEGORIES, API_BASE };

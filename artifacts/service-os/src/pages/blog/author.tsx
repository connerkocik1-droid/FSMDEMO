import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, ArrowLeft, Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { formatDate, categoryLabel, API_BASE } from "./index";

export default function AuthorPage() {
  const [, params] = useRoute("/blog/author/:slug");
  const slug = params?.slug || "";

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "author", slug],
    queryFn: () => fetch(`${API_BASE}/authors/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 inset-x-0 bg-background/80 backdrop-blur-md z-50 border-b">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="font-display font-bold text-xl tracking-tight text-foreground">ServiceOS</span>
            </Link>
          </div>
        </nav>
        <div className="pt-32 max-w-3xl mx-auto px-6 animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!data?.author) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
          <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { author, posts } = data;

  return (
    <div className="min-h-screen bg-background">
      <title>{`${author.name} — ServiceOS Blog`}</title>

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
          <Link href="/login" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm text-sm">
            Sign In
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>

        <div className="flex items-start gap-6 mb-12 p-8 bg-card border rounded-2xl">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">{author.name}</h1>
            <p className="text-muted-foreground font-medium mb-3">{author.role}</p>
            <p className="text-muted-foreground">{author.bio}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              {posts.length} article{posts.length !== 1 ? "s" : ""} published
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-foreground mb-8">Articles by {author.name}</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
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
          ))}
        </div>
      </div>
    </div>
  );
}

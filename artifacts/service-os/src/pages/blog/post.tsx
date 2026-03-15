import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Clock, Calendar, ArrowLeft, User, Tag, ChevronRight, BookOpen } from "lucide-react";
import { EmailCapture, formatDate, categoryLabel, API_BASE } from "./index";

function TableOfContents({ html }: { html: string }) {
  const [activeId, setActiveId] = useState("");
  const headings: { id: string; text: string; level: number }[] = [];

  const regex = /<h([2-3])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[2-3]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ""),
    });
  }

  const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headingsFromText: { id: string; text: string; level: number }[] = [];
  while ((match = headingRegex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headingsFromText.push({ level: parseInt(match[1]), id, text });
  }

  const finalHeadings = headings.length > 0 ? headings : headingsFromText;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    finalHeadings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [html]);

  if (finalHeadings.length === 0) return null;

  return (
    <nav className="sticky top-28">
      <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Table of Contents</h4>
      <ul className="space-y-2 border-l-2 border-muted">
        {finalHeadings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                "block text-sm py-1 border-l-2 -ml-[2px] transition-colors",
                level === 3 ? "pl-6" : "pl-4",
                activeId === id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AuthorCard({ author }: { author: any }) {
  if (!author) return null;

  return (
    <Link href={`/blog/author/${author.slug}`}>
      <div className="flex items-start gap-4 p-6 bg-card border rounded-2xl hover:shadow-md transition-all group">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Written by</p>
          <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{author.name}</h4>
          <p className="text-sm text-muted-foreground">{author.role}</p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{author.bio}</p>
        </div>
      </div>
    </Link>
  );
}

function RelatedPosts({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["blog", "related", slug],
    queryFn: () => fetch(`${API_BASE}/posts/${slug}/related`).then(r => r.json()),
  });

  if (!data?.posts?.length) return null;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-display font-bold text-foreground mb-8">Related Articles</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {data.posts.map((post: any) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <article className="group bg-card border rounded-2xl p-6 hover:shadow-lg transition-all h-full">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {categoryLabel(post.category)}
              </span>
              <h4 className="mt-3 font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.description}</p>
              <div className="flex items-center gap-1 mt-4 text-sm text-primary font-semibold">
                Read more <ChevronRight className="w-4 h-4" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CTABox() {
  return (
    <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground mt-16">
      <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">
        Ready to streamline your service business?
      </h3>
      <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
        Join thousands of service companies using ServiceOS to automate dispatching, invoicing, and customer communication.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/demo" className="px-6 py-3 bg-background text-foreground font-semibold rounded-xl hover:bg-background/90 transition-all shadow-sm">
          Request a Demo
        </Link>
        <Link href="/signup" className="px-6 py-3 border border-primary-foreground/30 text-primary-foreground font-semibold rounded-xl hover:bg-primary-foreground/10 transition-all">
          Start Free Trial
        </Link>
      </div>
    </div>
  );
}

function ArticleJsonLd({ post, author }: { post: any; author: any }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: author?.name || "ServiceOS Team",
    },
    publisher: {
      "@type": "Organization",
      name: "ServiceOS",
      logo: {
        "@type": "ImageObject",
        url: "/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${window.location.origin}/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => fetch(`${API_BASE}/posts/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { post, author } = data;

  const processedHtml = post.htmlContent?.replace(
    /<h([2-3])>(.*?)<\/h[2-3]>/gi,
    (_: string, level: string, text: string) => {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = plainText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  ) || "";

  const showUpdated = post.updatedAt && post.updatedAt !== post.publishedAt;

  const midPostIndex = Math.floor(processedHtml.length / 2);
  const insertPoint = processedHtml.indexOf("</p>", midPostIndex);
  const emailCaptureHtml = `<div id="mid-post-email-capture" class="my-12"></div>`;
  const finalHtml = insertPoint > 0
    ? processedHtml.slice(0, insertPoint + 4) + emailCaptureHtml + processedHtml.slice(insertPoint + 4)
    : processedHtml;

  return (
    <div className="min-h-screen bg-background">
      <ArticleJsonLd post={post} author={author} />

      <title>{`${post.title} — ServiceOS Blog`}</title>
      <meta name="description" content={post.description} />

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

        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/blog/${post.category}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
              {categoryLabel(post.category)}
            </Link>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">{post.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Published {formatDate(post.publishedAt)}
            </span>
            {showUpdated && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Updated {formatDate(post.updatedAt)}
              </span>
            )}
            {post.tags && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          <article
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />

          <aside className="hidden lg:block">
            <TableOfContents html={processedHtml} />
          </aside>
        </div>

        <div className="max-w-3xl mt-16 space-y-8">
          <AuthorCard author={author} />

          <EmailCapture source="blog-post" />
        </div>

        <RelatedPosts slug={slug} />

        <CTABox />
      </div>
    </div>
  );
}

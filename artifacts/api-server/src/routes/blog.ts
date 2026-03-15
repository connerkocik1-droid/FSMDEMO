import { Router } from "express";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const router = Router();

const CONTENT_DIR = path.resolve(import.meta.dirname, "../../../../content/blog");
const AUTHORS_DIR = path.resolve(import.meta.dirname, "../../../../content/authors");

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface PostFrontmatter {
  title: string;
  slug: string;
  description: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  published: boolean;
  featured?: boolean;
  coverImage?: string;
  tags?: string[];
}

interface Post extends PostFrontmatter {
  content: string;
  htmlContent?: string;
  readingTime: number;
}

interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith(".md"));

  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as PostFrontmatter;

      if (!frontmatter.published) return null;

      return {
        ...frontmatter,
        content,
        readingTime: calculateReadingTime(content),
      } as Post;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.publishedAt).getTime() - new Date(a!.publishedAt).getTime()) as Post[];
}

function getPostBySlug(slug: string): Post | null {
  if (!SLUG_REGEX.test(slug)) return null;
  const posts = getAllPosts();
  const post = posts.find(p => p.slug === slug);
  if (!post) return null;

  marked.setOptions({ breaks: false });
  const rawHtml = marked(post.content) as string;
  const sanitizedHtml = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/javascript:/gi, "");

  return {
    ...post,
    htmlContent: sanitizedHtml,
  };
}

function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

function getAuthor(slug: string): Author | null {
  if (!isValidSlug(slug)) return null;
  const filePath = path.join(AUTHORS_DIR, `${slug}.json`);
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(AUTHORS_DIR))) return null;
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

router.get("/posts", (_req, res) => {
  try {
    const { category, page = "1", limit = "12" } = _req.query;
    const allPosts = getAllPosts();

    let filtered = allPosts;
    if (category && category !== "all") {
      filtered = allPosts.filter(p => p.category === category);
    }

    const pageNum = Math.max(1, Math.floor(Number(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 12));
    const offset = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(offset, offset + limitNum);

    const postsWithoutContent = paginated.map(({ content, htmlContent, ...rest }) => rest);

    return res.json({
      posts: postsWithoutContent,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(filtered.length / limitNum)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/posts/featured", (_req, res) => {
  try {
    const allPosts = getAllPosts();
    const featured = allPosts.find(p => p.featured);
    if (!featured) {
      return res.json({ post: allPosts[0] ? (() => { const { content, htmlContent, ...rest } = allPosts[0]; return rest; })() : null });
    }
    const { content, htmlContent, ...rest } = featured;
    return res.json({ post: rest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/posts/sitemap", (_req, res) => {
  try {
    const allPosts = getAllPosts();
    const sitemapPosts = allPosts.map(p => ({
      slug: p.slug,
      updatedAt: p.updatedAt || p.publishedAt,
      category: p.category,
    }));
    return res.json({ posts: sitemapPosts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/posts/:slug", (req, res) => {
  try {
    const post = getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: "not_found" });

    const author = getAuthor(post.author);
    const { content, ...postData } = post;

    return res.json({ post: postData, author });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/posts/:slug/related", (req, res) => {
  try {
    const allPosts = getAllPosts();
    const current = allPosts.find(p => p.slug === req.params.slug);
    if (!current) return res.json({ posts: [] });

    const related = allPosts
      .filter(p => p.slug !== current.slug && p.category === current.category)
      .slice(0, 3)
      .map(({ content, htmlContent, ...rest }) => rest);

    return res.json({ posts: related });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/categories", (_req, res) => {
  try {
    const allPosts = getAllPosts();
    const categories = [...new Set(allPosts.map(p => p.category))];
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/authors/:slug", (req, res) => {
  try {
    const author = getAuthor(req.params.slug);
    if (!author) return res.status(404).json({ error: "not_found" });

    const allPosts = getAllPosts();
    const authorPosts = allPosts
      .filter(p => p.author === req.params.slug)
      .map(({ content, htmlContent, ...rest }) => rest);

    return res.json({ author, posts: authorPosts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

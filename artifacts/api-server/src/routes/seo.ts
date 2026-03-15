import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const STATIC_ROUTES = [
  "/",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/blog",
  "/demo",
  "/login",
  "/signup",
  "/compare",
  "/industries/landscaping",
  "/industries/hvac",
  "/industries/roofing",
  "/industries/pest-control",
  "/industries/cleaning",
  "/industries/moving",
  "/industries/plumbing",
  "/industries/lawn-care",
];

function discoverBlogPosts(): string[] {
  const blogDir = path.resolve(process.cwd(), "content", "blog");
  try {
    if (!fs.existsSync(blogDir)) return [];
    return fs
      .readdirSync(blogDir)
      .filter((f: string) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f: string) => `/blog/${f.replace(/\.(md|mdx)$/, "")}`);
  } catch {
    return [];
  }
}

router.get("/sitemap.xml", (_req: Request, res: Response) => {
  const domain = process.env["VITE_PUBLIC_DOMAIN"] || "https://serviceos.com";
  const blogPosts = discoverBlogPosts();
  const allRoutes = [...STATIC_ROUTES, ...blogPosts];
  const today = new Date().toISOString().split("T")[0];

  const urls = allRoutes
    .map(
      (route) => `  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "/" ? "1.0" : route === "/pricing" ? "0.9" : "0.8"}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

router.get("/robots.txt", (_req: Request, res: Response) => {
  const domain = process.env["VITE_PUBLIC_DOMAIN"] || "https://serviceos.com";

  const content = `User-agent: *
Allow: /
Allow: /pricing
Allow: /features
Allow: /about
Allow: /contact
Allow: /blog
Allow: /demo
Allow: /compare
Allow: /industries/

Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/
Disallow: /onboarding/
Disallow: /demo-access/

Sitemap: ${domain}/sitemap.xml
`;

  res.header("Content-Type", "text/plain");
  res.send(content);
});

export default router;

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import seoRouter from "./routes/seo.js";
import { demoGuard } from "./middlewares/demo-guard";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(demoGuard);

let redirects: { from: string; to: string }[] = [];
try {
  const redirectsPath = path.join(__dirname, "redirects.json");
  redirects = JSON.parse(fs.readFileSync(redirectsPath, "utf-8"));
} catch {
  console.warn("redirects.json not found, skipping 301 redirects");
}

for (const redirect of redirects) {
  app.get(redirect.from, (_req: Request, res: Response, _next: NextFunction) => {
    res.redirect(301, redirect.to);
  });
}

app.use("/api", router);
app.use(seoRouter);

app.get("/sitemap.xml", (_req, res) => {
  try {
    const contentDir = path.resolve(import.meta.dirname, "../../../content/blog");
    const posts: { slug: string; updatedAt: string }[] = [];

    if (fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".md"));
      for (const file of files) {
        const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
        const { data } = matter(raw);
        if (data.published && data.slug) {
          const dateStr = data.updatedAt || data.publishedAt;
          const date = dateStr ? new Date(dateStr) : null;
          if (date && !isNaN(date.getTime())) {
            posts.push({
              slug: data.slug,
              updatedAt: date.toISOString().split("T")[0],
            });
          }
        }
      }
    }

    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || "serviceos.com"}`;

    const urls = [
      { loc: "/", priority: "1.0" },
      { loc: "/blog", priority: "0.8" },
      ...posts.map(p => ({
        loc: `/blog/${p.slug}`,
        lastmod: p.updatedAt,
        priority: "0.7",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
${(u as any).lastmod ? `    <lastmod>${(u as any).lastmod}</lastmod>\n` : ""}    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    return res.send(xml);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error generating sitemap");
  }
});

export default app;

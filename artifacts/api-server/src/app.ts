import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import seoRouter from "./routes/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(seoRouter);

app.use("/api", router);

export default app;

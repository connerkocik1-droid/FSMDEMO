import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const tierVideoUrlsTable = pgTable("tier_video_urls", {
  id: serial("id").primaryKey(),
  tier: text("tier").notNull().unique(),
  videoUrl: text("video_url"),
  title: text("title"),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TierVideoUrl = typeof tierVideoUrlsTable.$inferSelect;
export type InsertTierVideoUrl = typeof tierVideoUrlsTable.$inferInsert;

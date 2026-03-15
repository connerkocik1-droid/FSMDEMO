import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tierVideosTable = pgTable("tier_videos", {
  id: serial("id").primaryKey(),
  tierName: text("tier_name").notNull().unique(),
  videoUrl: text("video_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTierVideoSchema = createInsertSchema(tierVideosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTierVideo = z.infer<typeof insertTierVideoSchema>;
export type TierVideo = typeof tierVideosTable.$inferSelect;

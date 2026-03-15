import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogSubscribersTable = pgTable("blog_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  source: text("source").default("blog"),
});

export const insertBlogSubscriberSchema = createInsertSchema(blogSubscribersTable).omit({ id: true, subscribedAt: true });
export type InsertBlogSubscriber = z.infer<typeof insertBlogSubscriberSchema>;
export type BlogSubscriber = typeof blogSubscribersTable.$inferSelect;

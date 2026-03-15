import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { customersTable } from "./customers";
import { jobsTable } from "./jobs";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  jobId: integer("job_id").references(() => jobsTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  testimonial: text("testimonial"),
  reviewToken: text("review_token").unique(),
  reviewSource: text("review_source"),
  isPublic: boolean("is_public").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

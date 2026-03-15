import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const liveDemoSessionsTable = pgTable("live_demo_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  datetime: timestamp("datetime").notNull(),
  durationMin: integer("duration_min").notNull().default(45),
  externalMeetingLink: text("external_meeting_link"),
  maxRegistrations: integer("max_registrations").default(50),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLiveDemoSessionSchema = createInsertSchema(liveDemoSessionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLiveDemoSession = z.infer<typeof insertLiveDemoSessionSchema>;
export type LiveDemoSession = typeof liveDemoSessionsTable.$inferSelect;

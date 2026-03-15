import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const liveDemoSessionsTable = pgTable("live_demo_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMin: integer("duration_min").notNull().default(60),
  meetingLink: text("meeting_link"),
  hostName: text("host_name"),
  isActive: boolean("is_active").notNull().default(true),
  maxRegistrants: integer("max_registrants"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LiveDemoSession = typeof liveDemoSessionsTable.$inferSelect;
export type InsertLiveDemoSession = typeof liveDemoSessionsTable.$inferInsert;

import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoSlotsTable = pgTable("demo_slots", {
  id: serial("id").primaryKey(),
  availableDays: jsonb("available_days").default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  timeBlocks: jsonb("time_blocks").default([{ start: "09:00", end: "10:00" }, { start: "14:00", end: "15:00" }]),
  maxPerDay: integer("max_per_day").notNull().default(3),
  bufferMin: integer("buffer_min").notNull().default(30),
  durationMin: integer("duration_min").notNull().default(30),
  blockedDates: jsonb("blocked_dates").default([]),
  emailToggles: jsonb("email_toggles").default({ confirmation: true, reminder24h: true, reminder1h: true, cancellation: true, internal: true }),
  assignmentMethod: text("assignment_method").notNull().default("round-robin"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDemoSlotSchema = createInsertSchema(demoSlotsTable).omit({ id: true });
export type InsertDemoSlot = z.infer<typeof insertDemoSlotSchema>;
export type DemoSlot = typeof demoSlotsTable.$inferSelect;

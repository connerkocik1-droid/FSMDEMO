import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { demoRequestsTable } from "./demo_requests";

export const demoBookingsTable = pgTable("demo_bookings", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => demoRequestsTable.id),
  hostUserId: integer("host_user_id"),
  slotDate: text("slot_date").notNull(),
  slotTime: text("slot_time").notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  status: text("status").notNull().default("confirmed"),
  zoomLink: text("zoom_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDemoBookingSchema = createInsertSchema(demoBookingsTable).omit({ id: true, createdAt: true });
export type InsertDemoBooking = z.infer<typeof insertDemoBookingSchema>;
export type DemoBooking = typeof demoBookingsTable.$inferSelect;

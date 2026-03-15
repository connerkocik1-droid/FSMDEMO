import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { jobsTable } from "./jobs";
import { customersTable } from "./customers";
import { usersTable } from "./users";

export const smsEventsTable = pgTable("sms_events", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  jobId: integer("job_id").references(() => jobsTable.id),
  customerId: integer("customer_id").references(() => customersTable.id),
  userId: integer("user_id").references(() => usersTable.id),
  direction: text("direction").notNull(),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  body: text("body").notNull(),
  eventType: text("event_type"),
  status: text("status").notNull().default("queued"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  twilioSid: text("twilio_sid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSmsEventSchema = createInsertSchema(smsEventsTable).omit({ id: true, createdAt: true });
export type InsertSmsEvent = z.infer<typeof insertSmsEventSchema>;
export type SmsEvent = typeof smsEventsTable.$inferSelect;

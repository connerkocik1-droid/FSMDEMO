import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { liveDemoSessionsTable } from "./live_demo_sessions";

export const liveDemoRegistrationsTable = pgTable("live_demo_registrations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => liveDemoSessionsTable.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLiveDemoRegistrationSchema = createInsertSchema(liveDemoRegistrationsTable).omit({ id: true, createdAt: true });
export type InsertLiveDemoRegistration = z.infer<typeof insertLiveDemoRegistrationSchema>;
export type LiveDemoRegistration = typeof liveDemoRegistrationsTable.$inferSelect;

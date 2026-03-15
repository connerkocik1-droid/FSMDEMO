import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { demoBookingsTable } from "./demo_bookings";

export const demoAccessTokensTable = pgTable("demo_access_tokens", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => demoBookingsTable.id),
  token: text("token").notNull().unique(),
  demoCompanyId: integer("demo_company_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  isRevoked: boolean("is_revoked").notNull().default(false),
});

export const insertDemoAccessTokenSchema = createInsertSchema(demoAccessTokensTable).omit({ id: true, createdAt: true });
export type InsertDemoAccessToken = z.infer<typeof insertDemoAccessTokenSchema>;
export type DemoAccessToken = typeof demoAccessTokensTable.$inferSelect;

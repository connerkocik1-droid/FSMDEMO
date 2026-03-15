import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoHostsTable = pgTable("demo_hosts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDemoHostSchema = createInsertSchema(demoHostsTable).omit({ id: true, createdAt: true });
export type InsertDemoHost = z.infer<typeof insertDemoHostSchema>;
export type DemoHost = typeof demoHostsTable.$inferSelect;

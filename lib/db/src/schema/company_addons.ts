import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const companyAddonsTable = pgTable("company_addons", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  addonType: text("addon_type").notNull(),
  stripeSubscriptionItemId: text("stripe_subscription_item_id"),
  isActive: boolean("is_active").notNull().default(true),
  quantity: integer("quantity").notNull().default(1),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompanyAddonSchema = createInsertSchema(companyAddonsTable).omit({ id: true, createdAt: true });
export type InsertCompanyAddon = z.infer<typeof insertCompanyAddonSchema>;
export type CompanyAddon = typeof companyAddonsTable.$inferSelect;

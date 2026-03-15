import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const addonUsageTable = pgTable("addon_usage", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id),
  addonType: text("addon_type").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull(),
  description: text("description"),
  stripeInvoiceItemId: text("stripe_invoice_item_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAddonUsageSchema = createInsertSchema(addonUsageTable).omit({ id: true, createdAt: true });
export type InsertAddonUsage = z.infer<typeof insertAddonUsageSchema>;
export type AddonUsage = typeof addonUsageTable.$inferSelect;

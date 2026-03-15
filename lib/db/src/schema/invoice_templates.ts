import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const invoiceTemplatesTable = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().unique().references(() => companiesTable.id),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#185FA5"),
  accentColor: text("accent_color").notNull().default("#0F3F75"),
  style: text("style").notNull().default("modern"),
  companyName: text("company_name"),
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").notNull().default("US"),
  taxRate: numeric("tax_rate").notNull().default("0"),
  paymentTerms: text("payment_terms").notNull().default("net30"),
  footerText: text("footer_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;
export type InvoiceTemplate = typeof invoiceTemplatesTable.$inferSelect;

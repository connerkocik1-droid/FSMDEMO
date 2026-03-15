import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const companySettingsTable = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id).unique(),
  timezone: text("timezone").notNull().default("America/New_York"),
  currency: text("currency").notNull().default("USD"),
  dateFormat: text("date_format").notNull().default("MM/DD/YYYY"),
  brandColor: text("brand_color").default("#2563eb"),
  logoUrl: text("logo_url"),
  website: text("website"),
  notificationPrefs: jsonb("notification_prefs").default({
    emailNotifications: true,
    smsNotifications: true,
    jobAlerts: true,
    reviewAlerts: true,
    invoiceAlerts: true,
  }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompanySettings = typeof companySettingsTable.$inferSelect;

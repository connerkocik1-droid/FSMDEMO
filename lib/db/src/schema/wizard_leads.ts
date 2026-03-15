import { pgTable, uuid, text, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const wizardLeadsTable = pgTable("wizard_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  industry: text("industry"),
  teamSize: text("team_size"),
  painPoints: text("pain_points").array(),
  recommendedTier: text("recommended_tier"),
  quoteJson: jsonb("quote_json"),
  selectedAddons: text("selected_addons").array(),
  estimatedMonthly: numeric("estimated_monthly", { precision: 8, scale: 2 }),
  email: text("email"),
  ctaClicked: text("cta_clicked"),
  ctaClickedAt: timestamp("cta_clicked_at"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWizardLeadSchema = createInsertSchema(wizardLeadsTable);
export type WizardLead = typeof wizardLeadsTable.$inferSelect;
export type InsertWizardLead = typeof wizardLeadsTable.$inferInsert;

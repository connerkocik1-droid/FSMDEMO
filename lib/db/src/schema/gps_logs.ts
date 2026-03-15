import { pgTable, serial, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { jobsTable } from "./jobs";
import { usersTable } from "./users";

export const gpsLogsTable = pgTable("gps_logs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  loggedAt: timestamp("logged_at").notNull().defaultNow(),
});

export const insertGpsLogSchema = createInsertSchema(gpsLogsTable).omit({ id: true });
export type InsertGpsLog = z.infer<typeof insertGpsLogSchema>;
export type GpsLog = typeof gpsLogsTable.$inferSelect;

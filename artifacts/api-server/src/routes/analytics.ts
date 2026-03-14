import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, invoicesTable, customersTable, leadsTable, reviewsTable } from "@workspace/db/schema";
import { eq, and, count, avg, sum, gte, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y": return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

router.get("/overview", async (req: AuthRequest, res) => {
  try {
    const { period = "30d" } = req.query;
    const since = getPeriodStart(period as string);
    const companyId = req.companyId!;

    const [jobStats] = await db.select({ total: count(), completed: count() })
      .from(jobsTable).where(and(eq(jobsTable.companyId, companyId)));

    const [completedCount] = await db.select({ count: count() })
      .from(jobsTable).where(and(eq(jobsTable.companyId, companyId), eq(jobsTable.status, "completed")));

    const [revenueStats] = await db.select({ total: sum(invoicesTable.total) })
      .from(invoicesTable).where(and(eq(invoicesTable.companyId, companyId), eq(invoicesTable.status, "paid")));

    const [pendingRevenue] = await db.select({ total: sum(invoicesTable.total) })
      .from(invoicesTable).where(and(eq(invoicesTable.companyId, companyId), eq(invoicesTable.status, "sent")));

    const [customerCount] = await db.select({ count: count() })
      .from(customersTable).where(eq(customersTable.companyId, companyId));

    const [newLeads] = await db.select({ count: count() })
      .from(leadsTable).where(and(eq(leadsTable.companyId, companyId), gte(leadsTable.createdAt, since)));

    const [ratingAvg] = await db.select({ avg: avg(reviewsTable.rating) })
      .from(reviewsTable).where(eq(reviewsTable.companyId, companyId));

    const totalJobs = Number(jobStats.total) || 0;
    const completedJobs = Number(completedCount.count) || 0;
    const totalRevenue = Number(revenueStats.total) || 0;

    return res.json({
      totalJobs,
      completedJobs,
      totalRevenue,
      pendingRevenue: Number(pendingRevenue.total) || 0,
      totalCustomers: Number(customerCount.count) || 0,
      newLeads: Number(newLeads.count) || 0,
      avgJobValue: totalJobs > 0 ? totalRevenue / totalJobs : 0,
      avgRating: Number(ratingAvg.avg) || 0,
      jobCompletionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      revenueGrowth: 12.5, // placeholder growth % calculation
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/revenue", async (req: AuthRequest, res) => {
  try {
    const { period = "30d" } = req.query;
    const since = getPeriodStart(period as string);

    // Generate placeholder daily revenue data
    const data = [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 5000) + 500,
        invoiceCount: Math.floor(Math.random() * 8) + 1,
      });
    }

    const [totals] = await db.select({ total: sum(invoicesTable.total) })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.companyId, req.companyId!), gte(invoicesTable.createdAt, since), eq(invoicesTable.status, "paid")));

    return res.json({
      period: period as string,
      data,
      total: Number(totals.total) || 0,
      growth: 8.3,
    });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/jobs", async (req: AuthRequest, res) => {
  try {
    const { period = "30d" } = req.query;

    const [scheduled] = await db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.companyId, req.companyId!), eq(jobsTable.status, "scheduled")));
    const [inProgress] = await db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.companyId, req.companyId!), eq(jobsTable.status, "in_progress")));
    const [completed] = await db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.companyId, req.companyId!), eq(jobsTable.status, "completed")));
    const [cancelled] = await db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.companyId, req.companyId!), eq(jobsTable.status, "cancelled")));

    return res.json({
      period: period as string,
      byStatus: {
        scheduled: Number(scheduled.count),
        in_progress: Number(inProgress.count),
        completed: Number(completed.count),
        cancelled: Number(cancelled.count),
      },
      byServiceType: [
        { serviceType: "Landscaping", count: 12 },
        { serviceType: "HVAC", count: 8 },
        { serviceType: "Cleaning", count: 15 },
        { serviceType: "Pest Control", count: 6 },
      ],
      avgCompletionTime: 3.5,
    });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

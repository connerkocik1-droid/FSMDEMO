import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, customersTable } from "@workspace/db/schema";
import { eq, and, count, desc, sql, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

function generateInvoiceNumber(id: number) {
  return `INV-${String(id).padStart(5, "0")}`;
}

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: any[] = [eq(invoicesTable.companyId, req.companyId!)];
    if (status) conditions.push(eq(invoicesTable.status, status as string));

    const invoices = await db.select().from(invoicesTable)
      .where(and(...conditions))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(invoicesTable).where(and(...conditions));

    return res.json({ invoices, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const subtotal = Number(req.body.subtotal) || 0;
    const taxRate = Number(req.body.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const [invoice] = await db.insert(invoicesTable).values({
      ...req.body,
      companyId: req.companyId!,
      invoiceNumber: "PENDING",
      subtotal: subtotal.toString(),
      taxRate: taxRate.toString(),
      taxAmount: taxAmount.toString(),
      total: total.toString(),
    }).returning();

    const [updated] = await db.update(invoicesTable)
      .set({ invoiceNumber: generateInvoiceNumber(invoice.id) })
      .where(eq(invoicesTable.id, invoice.id))
      .returning();

    return res.status(201).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:invoiceId", async (req: AuthRequest, res) => {
  try {
    const invoices = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);
    if (invoices.length === 0) return res.status(404).json({ error: "not_found" });
    return res.json(invoices[0]);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/:invoiceId", async (req: AuthRequest, res) => {
  try {
    const updateData: any = { ...req.body, updatedAt: new Date() };
    if (req.body.subtotal !== undefined) {
      const subtotal = Number(req.body.subtotal);
      const taxRate = Number(req.body.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      updateData.subtotal = subtotal.toString();
      updateData.taxRate = taxRate.toString();
      updateData.taxAmount = taxAmount.toString();
      updateData.total = (subtotal + taxAmount).toString();
    }
    if (req.body.paidAt) updateData.paidAt = new Date(req.body.paidAt);

    const [invoice] = await db.update(invoicesTable)
      .set(updateData)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .returning();
    if (!invoice) return res.status(404).json({ error: "not_found" });
    return res.json(invoice);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:invoiceId/send", async (req: AuthRequest, res) => {
  try {
    const [invoice] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);

    if (!invoice) return res.status(404).json({ error: "not_found" });
    if (invoice.status !== "draft") {
      return res.status(400).json({ error: "invalid_status", message: "Only draft invoices can be marked as sent" });
    }

    const [updated] = await db.update(invoicesTable)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(eq(invoicesTable.id, invoice.id))
      .returning();

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.patch("/:invoiceId/pay", async (req: AuthRequest, res) => {
  try {
    const [invoice] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);

    if (!invoice) return res.status(404).json({ error: "not_found" });
    if (invoice.status === "paid") {
      return res.status(400).json({ error: "already_paid", message: "Invoice is already paid" });
    }

    const paymentMethod = req.body?.paymentMethod || "manual";
    const [updated] = await db.update(invoicesTable)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.id, invoice.id))
      .returning();

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/analytics/revenue", async (req: AuthRequest, res) => {
  try {
    const { period = "30d" } = req.query;
    let daysBack = 30;
    if (period === "7d") daysBack = 7;
    else if (period === "90d") daysBack = 90;
    else if (period === "12m") daysBack = 365;

    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const paidInvoices = await db.select({
      total: invoicesTable.total,
      paidAt: invoicesTable.paidAt,
    }).from(invoicesTable)
      .where(and(
        eq(invoicesTable.companyId, req.companyId!),
        eq(invoicesTable.status, "paid"),
        gte(invoicesTable.paidAt, since),
      ));

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const invoiceCount = paidInvoices.length;

    const previousSince = new Date(since);
    previousSince.setDate(previousSince.getDate() - daysBack);
    const prevPaidInvoices = await db.select({
      total: invoicesTable.total,
    }).from(invoicesTable)
      .where(and(
        eq(invoicesTable.companyId, req.companyId!),
        eq(invoicesTable.status, "paid"),
        gte(invoicesTable.paidAt, previousSince),
      ));
    const prevTotal = prevPaidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const growth = prevTotal > 0 ? Math.round(((totalRevenue - prevTotal) / prevTotal) * 100) : 0;

    return res.json({
      total: totalRevenue,
      invoiceCount,
      growth,
      period,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

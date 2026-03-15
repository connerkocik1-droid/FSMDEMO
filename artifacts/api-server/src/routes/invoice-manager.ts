import { Router } from "express";
import { db } from "@workspace/db";
import { invoiceTemplatesTable, invoiceLineItemsTable, invoicesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();
router.use(requireAuth);

const US_STATE_TAX_RATES: Record<string, number> = {
  AL: 4.0, AK: 0.0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35,
  DE: 0.0, FL: 6.0, GA: 4.0, HI: 4.0, ID: 6.0, IL: 6.25, IN: 7.0,
  IA: 6.0, KS: 6.5, KY: 6.0, LA: 4.45, ME: 5.5, MD: 6.0, MA: 6.25,
  MI: 6.0, MN: 6.875, MS: 7.0, MO: 4.225, MT: 0.0, NE: 5.5, NV: 6.85,
  NH: 0.0, NJ: 6.625, NM: 5.125, NY: 4.0, NC: 4.75, ND: 5.0, OH: 5.75,
  OK: 4.5, OR: 0.0, PA: 6.0, RI: 7.0, SC: 6.0, SD: 4.5, TN: 7.0,
  TX: 6.25, UT: 6.1, VT: 6.0, VA: 5.3, WA: 6.5, WV: 6.0, WI: 5.0,
  WY: 4.0, DC: 6.0,
};

router.get("/template", async (req: AuthRequest, res) => {
  try {
    const [template] = await db.select().from(invoiceTemplatesTable)
      .where(eq(invoiceTemplatesTable.companyId, req.companyId!))
      .limit(1);
    return res.json(template || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/template", async (req: AuthRequest, res) => {
  try {
    const existing = await db.select().from(invoiceTemplatesTable)
      .where(eq(invoiceTemplatesTable.companyId, req.companyId!))
      .limit(1);

    let taxRate = req.body.taxRate;
    if (req.body.state && (taxRate === undefined || taxRate === null || taxRate === "")) {
      taxRate = US_STATE_TAX_RATES[req.body.state.toUpperCase()] ?? 0;
    }

    const data = {
      ...req.body,
      companyId: req.companyId!,
      taxRate: String(taxRate ?? 0),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      const [updated] = await db.update(invoiceTemplatesTable)
        .set(data)
        .where(eq(invoiceTemplatesTable.companyId, req.companyId!))
        .returning();
      return res.json(updated);
    } else {
      const [created] = await db.insert(invoiceTemplatesTable).values(data).returning();
      return res.status(201).json(created);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/state-tax/:state", async (req: AuthRequest, res) => {
  const state = req.params.state.toUpperCase();
  const rate = US_STATE_TAX_RATES[state];
  if (rate === undefined) return res.status(404).json({ error: "not_found" });
  return res.json({ state, taxRate: rate });
});

router.get("/:invoiceId/line-items", async (req: AuthRequest, res) => {
  try {
    const [invoice] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);
    if (!invoice) return res.status(404).json({ error: "not_found" });

    const items = await db.select().from(invoiceLineItemsTable)
      .where(eq(invoiceLineItemsTable.invoiceId, invoice.id));
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/:invoiceId/line-items", async (req: AuthRequest, res) => {
  try {
    const [invoice] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);
    if (!invoice) return res.status(404).json({ error: "not_found" });

    const qty = Number(req.body.quantity) || 1;
    const unitPrice = Number(req.body.unitPrice) || 0;
    const amount = qty * unitPrice;

    const [item] = await db.insert(invoiceLineItemsTable).values({
      invoiceId: invoice.id,
      description: req.body.description,
      quantity: String(qty),
      unitPrice: String(unitPrice),
      amount: String(amount),
    }).returning();

    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:invoiceId/line-items/:itemId", async (req: AuthRequest, res) => {
  try {
    const [invoice] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(req.params.invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);
    if (!invoice) return res.status(404).json({ error: "not_found" });

    await db.delete(invoiceLineItemsTable)
      .where(and(eq(invoiceLineItemsTable.id, Number(req.params.itemId)), eq(invoiceLineItemsTable.invoiceId, invoice.id)));

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/create-with-items", async (req: AuthRequest, res) => {
  try {
    const { customerId, jobId, dueDate, notes, taxRate, lineItems } = req.body;

    const subtotal = (lineItems || []).reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
    }, 0);

    const resolvedTaxRate = Number(taxRate) || 0;
    const taxAmount = subtotal * (resolvedTaxRate / 100);
    const total = subtotal + taxAmount;

    const [invoice] = await db.insert(invoicesTable).values({
      companyId: req.companyId!,
      customerId: Number(customerId),
      jobId: jobId ? Number(jobId) : undefined,
      invoiceNumber: "PENDING",
      status: "draft",
      subtotal: String(subtotal),
      taxRate: String(resolvedTaxRate),
      taxAmount: String(taxAmount),
      total: String(total),
      dueDate: dueDate || null,
      notes: notes || null,
    }).returning();

    const [updated] = await db.update(invoicesTable)
      .set({ invoiceNumber: `INV-${String(invoice.id).padStart(5, "0")}` })
      .where(eq(invoicesTable.id, invoice.id))
      .returning();

    if (lineItems && lineItems.length > 0) {
      await db.insert(invoiceLineItemsTable).values(
        lineItems.map((item: any) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: String(Number(item.quantity) || 1),
          unitPrice: String(Number(item.unitPrice) || 0),
          amount: String((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)),
        }))
      );
    }

    return res.status(201).json({ invoice: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/send-to-customer", async (req: AuthRequest, res) => {
  try {
    const { invoiceId } = req.body;
    const [invoice] = await db.select({ id: invoicesTable.id, status: invoicesTable.status })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, Number(invoiceId)), eq(invoicesTable.companyId, req.companyId!)))
      .limit(1);

    if (!invoice) return res.status(404).json({ error: "not_found" });

    const [updated] = await db.update(invoicesTable)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(eq(invoicesTable.id, invoice.id))
      .returning();

    return res.json({ success: true, invoice: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/ai-suggest-items", async (req: AuthRequest, res) => {
  try {
    const { serviceDescription, jobType, estimatedValue } = req.body;

    const prompt = `You are a field service business billing assistant. Generate realistic invoice line items for a service job.

Service details:
- Description: ${serviceDescription || "General field service"}
- Job type: ${jobType || "Field service"}
- Estimated value: ${estimatedValue ? `$${estimatedValue}` : "Not specified"}

Return a JSON array of 2-5 line items. Each item must have:
- description: string (clear service or parts description)
- quantity: number
- unitPrice: number (realistic market rate)

Example format:
[{"description":"Labor - HVAC Diagnostic","quantity":2,"unitPrice":85},{"description":"Filter Replacement","quantity":1,"unitPrice":45}]

Return ONLY valid JSON array, no markdown or explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content || "[]";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const items = JSON.parse(cleaned);

    return res.json({ items });
  } catch (err) {
    console.error("AI suggest items error:", err);
    return res.status(500).json({ error: "ai_error", message: "Failed to generate suggestions" });
  }
});

export default router;

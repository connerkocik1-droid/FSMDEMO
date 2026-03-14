import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db/schema";
import { eq, and, count, desc, ilike, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let conditions: any[] = [eq(customersTable.companyId, req.companyId!)];
    if (search) {
      conditions.push(
        or(
          ilike(customersTable.firstName, `%${search}%`),
          ilike(customersTable.lastName, `%${search}%`),
          ilike(customersTable.email, `%${search}%`),
          ilike(customersTable.phone, `%${search}%`)
        )
      );
    }

    const customers = await db.select().from(customersTable)
      .where(and(...conditions))
      .orderBy(desc(customersTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(customersTable).where(and(...conditions));

    return res.json({ customers, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const [customer] = await db.insert(customersTable).values({
      ...req.body,
      companyId: req.companyId!,
    }).returning();
    return res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/:customerId", async (req: AuthRequest, res) => {
  try {
    const customers = await db.select().from(customersTable)
      .where(and(eq(customersTable.id, Number(req.params.customerId)), eq(customersTable.companyId, req.companyId!)))
      .limit(1);
    if (customers.length === 0) return res.status(404).json({ error: "not_found" });
    return res.json(customers[0]);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/:customerId", async (req: AuthRequest, res) => {
  try {
    const [customer] = await db.update(customersTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(customersTable.id, Number(req.params.customerId)), eq(customersTable.companyId, req.companyId!)))
      .returning();
    if (!customer) return res.status(404).json({ error: "not_found" });
    return res.json(customer);
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

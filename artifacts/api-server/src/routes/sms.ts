import { Router } from "express";
import { db } from "@workspace/db";
import { smsEventsTable } from "@workspace/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/events", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { jobId, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions: any[] = [eq(smsEventsTable.companyId, req.companyId!)];
    if (jobId) conditions.push(eq(smsEventsTable.jobId, Number(jobId)));

    const events = await db.select().from(smsEventsTable)
      .where(and(...conditions))
      .orderBy(desc(smsEventsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(smsEventsTable).where(and(...conditions));

    return res.json({ events, total: Number(total), page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/send", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { toNumber, body, jobId, customerId, aiGenerate, aiContext } = req.body;
    let messageBody = body;

    // If AI generation requested and OpenAI key available
    if (aiGenerate && process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant for a field service business. Write a concise, professional SMS message to a customer. Keep it under 160 characters." },
            { role: "user", content: aiContext || body },
          ],
          max_tokens: 100,
        });
        messageBody = completion.choices[0]?.message?.content || body;
      } catch (aiErr) {
        console.error("AI generation failed, using original body:", aiErr);
      }
    }

    // Send via Twilio if configured
    let twilioSid: string | undefined;
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const { default: twilio } = await import("twilio");
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const message = await client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: toNumber,
        });
        twilioSid = message.sid;
      } catch (twilioErr) {
        console.error("Twilio send failed:", twilioErr);
      }
    }

    const [event] = await db.insert(smsEventsTable).values({
      companyId: req.companyId!,
      jobId: jobId || null,
      customerId: customerId || null,
      direction: "outbound",
      fromNumber: process.env.TWILIO_PHONE_NUMBER || "system",
      toNumber,
      body: messageBody,
      status: twilioSid ? "sent" : "simulated",
      aiGenerated: Boolean(aiGenerate),
      twilioSid,
    }).returning();

    return res.status(201).json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const { Body, From, To } = req.body;
    // Store incoming SMS
    // Note: We'd need to look up companyId from the To number in a real implementation
    console.log("Incoming SMS:", { From, To, Body });
    return res.status(200).send("<?xml version='1.0' encoding='UTF-8'?><Response></Response>");
  } catch (err) {
    return res.status(500).send("Error");
  }
});

export default router;

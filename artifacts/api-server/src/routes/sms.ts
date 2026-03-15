import { Router } from "express";
import { db } from "@workspace/db";
import { smsEventsTable, jobsTable, gpsLogsTable, usersTable, companiesTable, customersTable, reviewsTable } from "@workspace/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import crypto from "crypto";

const router = Router();

type SmsIntent = "START" | "COMPLETE" | "ISSUE" | "UNKNOWN";

interface ParsedIntent {
  intent: SmsIntent;
  jobId?: number;
  issueDescription?: string;
  lat?: number;
  lng?: number;
}

function parseIntentBasic(body: string): ParsedIntent {
  const upper = body.trim().toUpperCase();

  const startMatch = upper.match(/^START\s+(?:JOB\s+)?#?(\d+)/);
  if (startMatch) {
    return { intent: "START", jobId: parseInt(startMatch[1]) };
  }

  const completeMatch = upper.match(/^(?:COMPLETE|DONE|FINISH(?:ED)?)\s+(?:JOB\s+)?#?(\d+)/);
  if (completeMatch) {
    return { intent: "COMPLETE", jobId: parseInt(completeMatch[1]) };
  }

  const issueMatch = upper.match(/^(?:ISSUE|PROBLEM|HELP)\s+(?:JOB\s+)?#?(\d+)\s*(.*)/i);
  if (issueMatch) {
    return { intent: "ISSUE", jobId: parseInt(issueMatch[1]), issueDescription: issueMatch[2] || "Issue reported via SMS" };
  }

  const gpsMatch = body.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  let lat: number | undefined, lng: number | undefined;
  if (gpsMatch) {
    lat = parseFloat(gpsMatch[1]);
    lng = parseFloat(gpsMatch[2]);
  }

  if (upper.startsWith("START")) return { intent: "START", lat, lng };
  if (upper.startsWith("COMPLETE") || upper.startsWith("DONE")) return { intent: "COMPLETE", lat, lng };
  if (upper.startsWith("ISSUE") || upper.startsWith("PROBLEM")) return { intent: "ISSUE", issueDescription: body, lat, lng };

  return { intent: "UNKNOWN", lat, lng };
}

async function parseIntentWithAI(body: string): Promise<ParsedIntent> {
  if (!process.env.OPENAI_API_KEY) {
    return parseIntentBasic(body);
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an SMS intent parser for a field service company. Parse the message and return JSON with:
- intent: "START" (crew starting a job), "COMPLETE" (job finished), "ISSUE" (problem reported), or "UNKNOWN"
- jobId: number if mentioned (e.g. "job 123" or "#123")
- issueDescription: string if intent is ISSUE
- lat: number if GPS coordinates found
- lng: number if GPS coordinates found
Return ONLY valid JSON.`
        },
        { role: "user", content: body },
      ],
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      intent: (["START", "COMPLETE", "ISSUE"].includes(parsed.intent) ? parsed.intent : "UNKNOWN") as SmsIntent,
      jobId: parsed.jobId ? Number(parsed.jobId) : undefined,
      issueDescription: parsed.issueDescription,
      lat: parsed.lat ? Number(parsed.lat) : undefined,
      lng: parsed.lng ? Number(parsed.lng) : undefined,
    };
  } catch (err) {
    console.error("AI intent parse failed, falling back to basic:", err);
    return parseIntentBasic(body);
  }
}

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
    if (process.env.TWILIO_AUTH_TOKEN) {
      try {
        const { default: twilio } = await import("twilio");
        const twilioSignature = req.headers["x-twilio-signature"] as string;
        const url = `${process.env.APP_URL || "https://serviceos.app"}/api/sms/webhook`;
        const isValid = twilio.validateRequest(
          process.env.TWILIO_AUTH_TOKEN,
          twilioSignature || "",
          url,
          req.body || {},
        );
        if (!isValid) {
          console.warn("Invalid Twilio webhook signature, rejecting request");
          return res.status(403).send("Forbidden");
        }
      } catch (validationErr) {
        console.error("Twilio validation error:", validationErr);
      }
    }

    const { Body, From, To } = req.body;
    console.log("Incoming SMS:", { From, To, Body });

    const parsed = await parseIntentWithAI(Body || "");

    const users = await db.select({
      id: usersTable.id,
      companyId: usersTable.companyId,
    }).from(usersTable)
      .where(eq(usersTable.phone, From))
      .limit(1);

    const companyId = users.length > 0 ? users[0].companyId : null;
    const userId = users.length > 0 ? users[0].id : null;

    if (companyId) {
      await db.insert(smsEventsTable).values({
        companyId,
        jobId: parsed.jobId || null,
        direction: "inbound",
        fromNumber: From,
        toNumber: To,
        body: Body,
        status: "received",
        aiGenerated: false,
      });
    }

    let responseText = "Message received. Thank you!";

    if (parsed.intent === "START" && parsed.jobId && companyId) {
      const [job] = await db.select().from(jobsTable)
        .where(and(eq(jobsTable.id, parsed.jobId), eq(jobsTable.companyId, companyId)))
        .limit(1);

      if (job) {
        await db.update(jobsTable)
          .set({ status: "in_progress", actualStart: new Date(), updatedAt: new Date() })
          .where(eq(jobsTable.id, parsed.jobId));

        if ((parsed.lat || job.lat) && userId) {
          await db.insert(gpsLogsTable).values({
            jobId: parsed.jobId,
            userId,
            lat: parsed.lat || job.lat || 0,
            lng: parsed.lng || job.lng || 0,
          });
        }
        responseText = `Job #${parsed.jobId} started. Stay safe!`;
      } else {
        responseText = `Job #${parsed.jobId} not found.`;
      }
    } else if (parsed.intent === "COMPLETE" && parsed.jobId && companyId) {
      const [job] = await db.select().from(jobsTable)
        .where(and(eq(jobsTable.id, parsed.jobId), eq(jobsTable.companyId, companyId)))
        .limit(1);

      if (job) {
        await db.update(jobsTable)
          .set({ status: "completed", actualEnd: new Date(), updatedAt: new Date() })
          .where(eq(jobsTable.id, parsed.jobId));

        if (job.customerId) {
          const token = crypto.randomBytes(16).toString("hex");
          await db.insert(reviewsTable).values({
            companyId,
            customerId: job.customerId,
            jobId: parsed.jobId,
            rating: 0,
            reviewToken: token,
            status: "pending",
          });
        }

        responseText = `Job #${parsed.jobId} completed. Great work!`;
      } else {
        responseText = `Job #${parsed.jobId} not found.`;
      }
    } else if (parsed.intent === "ISSUE" && parsed.jobId && companyId) {
      const [job] = await db.select().from(jobsTable)
        .where(and(eq(jobsTable.id, parsed.jobId), eq(jobsTable.companyId, companyId)))
        .limit(1);

      if (job) {
        await db.update(jobsTable)
          .set({ status: "issue", notes: `${job.notes || ""}\n[SMS Issue] ${parsed.issueDescription || "Issue reported"}`.trim(), updatedAt: new Date() })
          .where(eq(jobsTable.id, parsed.jobId));
        responseText = `Issue reported for job #${parsed.jobId}. Manager notified.`;
      }
    }

    const twiml = `<?xml version='1.0' encoding='UTF-8'?><Response><Message>${responseText}</Message></Response>`;
    res.set("Content-Type", "text/xml");
    return res.status(200).send(twiml);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("<?xml version='1.0' encoding='UTF-8'?><Response></Response>");
  }
});

router.post("/review-request", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { jobId, customerId, customerPhone } = req.body;
    if (!jobId || !customerId) {
      return res.status(400).json({ error: "jobId and customerId required" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const [review] = await db.insert(reviewsTable).values({
      companyId: req.companyId!,
      customerId,
      jobId,
      rating: 0,
      reviewToken: token,
      status: "pending",
    }).returning();

    const reviewUrl = `${process.env.APP_URL || "https://serviceos.app"}/review/${token}`;
    const messageBody = `How was your service? We'd love your feedback! Please rate us here: ${reviewUrl}`;

    if (customerPhone) {
      let twilioSid: string | undefined;
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const { default: twilio } = await import("twilio");
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const msg = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: customerPhone,
          });
          twilioSid = msg.sid;
        } catch (twilioErr) {
          console.error("Twilio review SMS failed:", twilioErr);
        }
      }

      await db.insert(smsEventsTable).values({
        companyId: req.companyId!,
        jobId,
        customerId,
        direction: "outbound",
        fromNumber: process.env.TWILIO_PHONE_NUMBER || "system",
        toNumber: customerPhone,
        body: messageBody,
        status: twilioSid ? "sent" : "simulated",
        aiGenerated: false,
        twilioSid,
      });
    }

    return res.status(201).json({ review, reviewUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

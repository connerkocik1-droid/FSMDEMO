import { Router } from "express";
import { db } from "@workspace/db";
import { demoRequestsTable } from "@workspace/db/schema";
import { nanoid } from "nanoid";

const router = Router();

// Generate demo slots for the next 3 business days
function getNextDemoSlots() {
  const slots = [];
  const now = new Date();
  let date = new Date(now);
  date.setDate(date.getDate() + 1);

  const times = ["09:00", "11:00", "14:00", "16:00"];
  let slotsFound = 0;

  while (slotsFound < 3) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (const time of times) {
        if (slotsFound >= 3) break;
        const [hour, min] = time.split(":").map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hour, min, 0, 0);
        
        slots.push({
          id: `slot-${slotDate.toISOString()}`,
          datetime: slotDate.toISOString(),
          label: slotDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + ` at ${time} EST`,
          available: true,
        });
        slotsFound++;
      }
    }
    date.setDate(date.getDate() + 1);
  }

  return slots;
}

router.get("/slots", (_req, res) => {
  const slots = getNextDemoSlots();
  return res.json({
    slots,
    calendarLink: "https://calendly.com/serviceos/demo",
  });
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyName, businessType, teamSize, message, preferredSlot, wantsRecorded, wantsPrivate } = req.body;

    const confirmationCode = `DEMO-${nanoid(8).toUpperCase()}`;
    const slots = getNextDemoSlots();
    const scheduledSlot = preferredSlot || slots[0]?.id;

    const [request] = await db.insert(demoRequestsTable).values({
      firstName,
      lastName,
      email,
      phone,
      companyName,
      businessType,
      teamSize,
      message,
      preferredSlot,
      wantsRecorded: Boolean(wantsRecorded),
      wantsPrivate: Boolean(wantsPrivate),
      confirmationCode,
      scheduledSlot,
      status: "pending",
    }).returning();

    return res.status(201).json({
      id: request.id,
      confirmationCode: request.confirmationCode,
      scheduledSlot: request.scheduledSlot,
      nextSteps: wantsRecorded
        ? "We've sent you a link to watch our recorded demo. You can also schedule a live session anytime."
        : wantsPrivate
        ? "Our team will contact you within 24 hours to confirm your private demo time."
        : `Your demo is scheduled! We'll send a calendar invite and Zoom link to ${email} shortly.`,
      createdAt: request.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;

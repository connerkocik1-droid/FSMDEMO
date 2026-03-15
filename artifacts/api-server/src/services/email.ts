import { db } from "@workspace/db";
import { emailLogTable } from "@workspace/db/schema";

export type EmailType = "demo_confirmation" | "demo_reminder_24h" | "demo_reminder_1h" | "demo_cancellation" | "demo_internal" | "review_request" | "welcome" | "job_completed";

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  type: EmailType;
  relatedId?: number;
  relatedType?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; logId: number }> {
  const resendKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL || "noreply@serviceos.app";

  let status: "sent" | "failed" | "stubbed" = "stubbed";
  let externalId: string | null = null;

  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: params.to,
          subject: params.subject,
          html: params.body,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        status = "sent";
        externalId = data.id;
      } else {
        status = "failed";
        console.error("Resend API error:", await response.text());
      }
    } catch (err) {
      status = "failed";
      console.error("Email send error:", err);
    }
  } else {
    console.log(`[EMAIL STUB] To: ${params.to} | Subject: ${params.subject} | Type: ${params.type}`);
  }

  const [log] = await db.insert(emailLogTable).values({
    toAddress: params.to,
    subject: params.subject,
    body: params.body,
    emailType: params.type,
    status,
    externalId,
    relatedId: params.relatedId,
    relatedType: params.relatedType,
  }).returning();

  return { success: status === "sent" || status === "stubbed", logId: log.id };
}

export function buildDemoConfirmationEmail(name: string, date: string, time: string): { subject: string; body: string } {
  return {
    subject: "Your ServiceOS Demo is Confirmed!",
    body: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Demo Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your ServiceOS demo has been scheduled for:</p>
        <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${date} at ${time}</strong>
        </div>
        <p>You'll receive a calendar invite and meeting link shortly.</p>
        <p>— The ServiceOS Team</p>
      </div>
    `,
  };
}

export function buildDemoReminderEmail(name: string, date: string, time: string, hours: number): { subject: string; body: string } {
  return {
    subject: `Reminder: Your ServiceOS Demo is in ${hours} hour${hours > 1 ? "s" : ""}`,
    body: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Demo Reminder</h1>
        <p>Hi ${name},</p>
        <p>Just a friendly reminder that your ServiceOS demo is coming up:</p>
        <div style="background: #f0f4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${date} at ${time}</strong>
        </div>
        <p>See you soon!</p>
        <p>— The ServiceOS Team</p>
      </div>
    `,
  };
}

export function buildDemoCancellationEmail(name: string): { subject: string; body: string } {
  return {
    subject: "Your ServiceOS Demo Has Been Cancelled",
    body: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">Demo Cancelled</h1>
        <p>Hi ${name},</p>
        <p>Your ServiceOS demo has been cancelled. If you'd like to reschedule, visit our demo page anytime.</p>
        <p>— The ServiceOS Team</p>
      </div>
    `,
  };
}

export function buildInternalNotificationEmail(requesterName: string, company: string, businessType: string, date: string): { subject: string; body: string } {
  return {
    subject: `New Demo Booked: ${requesterName} from ${company}`,
    body: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">New Demo Request</h1>
        <p><strong>${requesterName}</strong> from <strong>${company}</strong> (${businessType}) has booked a demo for ${date}.</p>
      </div>
    `,
  };
}

export function buildReviewRequestEmail(customerName: string, reviewUrl: string): { subject: string; body: string } {
  return {
    subject: "How did we do? Leave us a review!",
    body: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a2e;">We'd Love Your Feedback!</h1>
        <p>Hi ${customerName},</p>
        <p>Thank you for choosing our services. We'd appreciate your honest feedback.</p>
        <a href="${reviewUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Leave a Review</a>
        <p style="margin-top: 16px;">— The Team</p>
      </div>
    `,
  };
}

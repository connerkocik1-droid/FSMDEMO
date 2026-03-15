import { Router } from "express";
import { db } from "@workspace/db";
import { wizardLeadsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { WIZARD_SYSTEM_PROMPT, WIZARD_FALLBACK_QUOTE } from "../prompts/wizardPrompt.js";

const router = Router();

router.post("/quote", async (req, res) => {
  const { session_id, industry, team_size, pain_points } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: "session_id required" });
  }

  let quote: Record<string, unknown>;

  try {
    const userMessage = `Industry: ${industry || "Unknown"}
Team size: ${team_size || "Unknown"}
Pain points: ${Array.isArray(pain_points) ? pain_points.join(", ") : pain_points || "None specified"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: WIZARD_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    quote = JSON.parse(cleaned);
  } catch (err) {
    console.error("[wizard/quote] OpenAI or parse error:", err);
    quote = WIZARD_FALLBACK_QUOTE;
  }

  const defaultOnAddons = ((quote.suggested_addons as any[]) ?? [])
    .filter((a: any) => a.default_on)
    .map((a: any) => a.addon_key);

  const estimatedMonthly =
    Number(quote.monthly_base ?? 59) +
    Number(quote.user_addon_cost ?? 0) +
    ((quote.suggested_addons as any[]) ?? [])
      .filter((a: any) => a.default_on)
      .reduce((sum: number, a: any) => sum + (a.price ?? 0), 0);

  try {
    const existing = await db
      .select()
      .from(wizardLeadsTable)
      .where(eq(wizardLeadsTable.sessionId, session_id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(wizardLeadsTable)
        .set({
          industry,
          teamSize: team_size,
          painPoints: Array.isArray(pain_points) ? pain_points : [],
          recommendedTier: String(quote.recommended_tier ?? "pro"),
          quoteJson: quote,
          selectedAddons: defaultOnAddons,
          estimatedMonthly: String(estimatedMonthly),
          completed: true,
        })
        .where(eq(wizardLeadsTable.sessionId, session_id));
    } else {
      await db.insert(wizardLeadsTable).values({
        sessionId: session_id,
        industry,
        teamSize: team_size,
        painPoints: Array.isArray(pain_points) ? pain_points : [],
        recommendedTier: String(quote.recommended_tier ?? "pro"),
        quoteJson: quote,
        selectedAddons: defaultOnAddons,
        estimatedMonthly: String(estimatedMonthly),
        completed: true,
      });
    }
  } catch (dbErr) {
    console.error("[wizard/quote] DB error:", dbErr);
  }

  return res.json(quote);
});

router.post("/lead", async (req, res) => {
  const { session_id, email } = req.body;
  if (!session_id || !email) {
    return res.status(400).json({ error: "session_id and email required" });
  }

  try {
    await db
      .update(wizardLeadsTable)
      .set({ email })
      .where(eq(wizardLeadsTable.sessionId, session_id));
  } catch (err) {
    console.error("[wizard/lead] DB error:", err);
  }

  return res.json({ success: true });
});

router.post("/cta-click", async (req, res) => {
  const { session_id, cta, selected_addons, estimated_monthly } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: "session_id required" });
  }

  try {
    await db
      .update(wizardLeadsTable)
      .set({
        ctaClicked: cta,
        ctaClickedAt: new Date(),
        selectedAddons: Array.isArray(selected_addons) ? selected_addons : [],
        estimatedMonthly: estimated_monthly != null ? String(estimated_monthly) : undefined,
      })
      .where(eq(wizardLeadsTable.sessionId, session_id));
  } catch (err) {
    console.error("[wizard/cta-click] DB error:", err);
  }

  return res.json({ success: true });
});

export default router;

import { db } from "@workspace/db";
import { auditLogTable } from "@workspace/db/schema";

export async function logAudit(params: {
  companyId: number;
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: string | number;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogTable).values({
      companyId: params.companyId,
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId != null ? String(params.entityId) : null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("Audit log insert failed:", err);
  }
}

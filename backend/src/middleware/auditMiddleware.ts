import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAuditEvent(params: {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName || 'System/User',
        userRole: params.userRole || 'SYSTEM',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress || '127.0.0.1'
      }
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}

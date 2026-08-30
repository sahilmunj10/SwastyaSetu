"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function logAuditEvent(params) {
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
    }
    catch (err) {
        console.error('Audit Log Error:', err);
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = getAuditLogs;
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getAuditLogs(req, res) {
    try {
        const { action, entity, limit } = req.query;
        const where = {};
        if (action)
            where.action = String(action);
        if (entity)
            where.entity = String(entity);
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit ? Number(limit) : 50
        });
        res.json({ logs });
    }
    catch (err) {
        console.error('Get audit logs error:', err);
        res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
}
async function getNotifications(req, res) {
    try {
        const userId = req.user?.id;
        const where = {};
        if (userId) {
            where.OR = [
                { userId },
                { userId: null }
            ];
        }
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({
            notifications,
            unreadCount: notifications.filter(n => !n.read).length
        });
    }
    catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
}
async function markNotificationRead(req, res) {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json({ notification, message: 'Notification marked as read.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update notification.' });
    }
}

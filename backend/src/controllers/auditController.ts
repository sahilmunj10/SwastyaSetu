import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { action, entity, limit } = req.query;

    const where: any = {};
    if (action) where.action = String(action);
    if (entity) where.entity = String(entity);

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? Number(limit) : 50
    });

    res.json({ logs });
  } catch (err: any) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const where: any = {};
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
  } catch (err: any) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({ notification, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
}

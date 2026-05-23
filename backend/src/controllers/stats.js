import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStats(req, res) {
  const userId = req.userId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  try {
    const [
      total,
      done,
      completedToday,
      overdue,
      urgent,
      byPriority,
      recentDone,
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'DONE' } }),
      prisma.task.count({
        where: {
          userId,
          status: 'DONE',
          completedAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: { not: 'DONE' },
          dueDate: { lt: now },
        },
      }),
      prisma.task.count({
        where: { userId, priority: 'URGENT', status: { not: 'DONE' } },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { userId, status: { not: 'DONE' } },
        _count: true,
      }),
      prisma.task.findMany({
        where: { userId, status: 'DONE' },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, completedAt: true },
      }),
    ]);

    const pending = total - done;

    return res.json({
      total,
      done,
      pending,
      completedToday,
      overdue,
      urgent,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      byPriority,
      recentDone,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTasks(req, res) {
  const { status, priority, categoryId, search, tagId } = req.query;

  const where = { userId: req.userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (categoryId) where.categoryId = categoryId;
  if (search) where.title = { contains: search };
  if (tagId) where.tags = { some: { tagId } };

  try {
    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const formatted = tasks.map((t) => ({
      ...t,
      tags: t.tags.map((tt) => tt.tag),
    }));

    return res.json({ tasks: formatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
}

export async function createTask(req, res) {
  const { title, description, dueDate, priority, categoryId, tagIds } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título é obrigatório.' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        userId: req.userId,
        categoryId: categoryId || null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return res.status(201).json({ task: { ...task, tags: task.tags.map((tt) => tt.tag) } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
}

export async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, dueDate, priority, status, categoryId, tagIds } = req.body;

  try {
    const exists = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!exists) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    // Rebuild tags
    if (tagIds !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: id } });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        priority,
        status,
        categoryId: categoryId !== undefined ? categoryId || null : undefined,
        completedAt: status === 'DONE' ? new Date() : status === 'TODO' ? null : undefined,
        tags: tagIds !== undefined
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return res.json({ task: { ...task, tags: task.tags.map((tt) => tt.tag) } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
}

export async function deleteTask(req, res) {
  const { id } = req.params;

  try {
    const exists = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!exists) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Tarefa deletada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar tarefa.' });
  }
}

export async function completeTask(req, res) {
  const { id } = req.params;

  try {
    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === 'DONE' ? new Date() : null,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return res.json({ task: { ...updated, tags: updated.tags.map((tt) => tt.tag) } });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
}

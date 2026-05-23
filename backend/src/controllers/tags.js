import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTags(req, res) {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json({ tags });
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar tags.' });
  }
}

export async function createTag(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

  try {
    const tag = await prisma.tag.create({
      data: { name, userId: req.userId },
    });
    return res.status(201).json({ tag });
  } catch {
    return res.status(500).json({ error: 'Erro ao criar tag.' });
  }
}

export async function deleteTag(req, res) {
  const { id } = req.params;

  try {
    const exists = await prisma.tag.findFirst({ where: { id, userId: req.userId } });
    if (!exists) return res.status(404).json({ error: 'Tag não encontrada.' });

    await prisma.tag.delete({ where: { id } });
    return res.json({ message: 'Tag deletada.' });
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar tag.' });
  }
}

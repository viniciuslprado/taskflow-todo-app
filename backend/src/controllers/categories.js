import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
}

export async function createCategory(req, res) {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });

  try {
    const category = await prisma.category.create({
      data: { name, color: color || '#6366f1', userId: req.userId },
    });
    return res.status(201).json({ category });
  } catch {
    return res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, color } = req.body;

  try {
    const exists = await prisma.category.findFirst({ where: { id, userId: req.userId } });
    if (!exists) return res.status(404).json({ error: 'Categoria não encontrada.' });

    const category = await prisma.category.update({ where: { id }, data: { name, color } });
    return res.json({ category });
  } catch {
    return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const exists = await prisma.category.findFirst({ where: { id, userId: req.userId } });
    if (!exists) return res.status(404).json({ error: 'Categoria não encontrada.' });

    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Categoria deletada.' });
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar categoria.' });
  }
}

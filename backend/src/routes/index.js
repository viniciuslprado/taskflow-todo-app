import { Router } from 'express';
import { register, login, me } from '../controllers/auth.js';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../controllers/tasks.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.js';
import { getTags, createTag, deleteTag } from '../controllers/tags.js';
import { getStats } from '../controllers/stats.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Auth routes (public)
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, me);

// Protected routes
router.get('/stats', authenticate, getStats);

router.get('/tasks', authenticate, getTasks);
router.post('/tasks', authenticate, createTask);
router.put('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, deleteTask);
router.patch('/tasks/:id/complete', authenticate, completeTask);

router.get('/categories', authenticate, getCategories);
router.post('/categories', authenticate, createCategory);
router.put('/categories/:id', authenticate, updateCategory);
router.delete('/categories/:id', authenticate, deleteCategory);

router.get('/tags', authenticate, getTags);
router.post('/tags', authenticate, createTag);
router.delete('/tags/:id', authenticate, deleteTag);

export default router;

import api from './axios.js';

export const authApi = {
  login:    (data)  => api.post('/auth/login', data),
  register: (data)  => api.post('/auth/register', data),
  me:       ()      => api.get('/auth/me'),
};

export const tasksApi = {
  getAll:   (params) => api.get('/tasks', { params }),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, d)  => api.put(`/tasks/${id}`, d),
  remove:   (id)     => api.delete(`/tasks/${id}`),
  complete: (id)     => api.patch(`/tasks/${id}/complete`),
};

export const categoriesApi = {
  getAll:  ()          => api.get('/categories'),
  create:  (data)      => api.post('/categories', data),
  update:  (id, data)  => api.put(`/categories/${id}`, data),
  remove:  (id)        => api.delete(`/categories/${id}`),
};

export const tagsApi = {
  getAll:  ()      => api.get('/tags'),
  create:  (data)  => api.post('/tags', data),
  remove:  (id)    => api.delete(`/tags/${id}`),
};

export const statsApi = {
  get: () => api.get('/stats'),
};

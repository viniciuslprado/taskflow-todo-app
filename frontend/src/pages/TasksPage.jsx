import { useState, useEffect, useCallback } from 'react';
import { tasksApi, categoriesApi, tagsApi } from '../api/endpoints.js';
import toast from 'react-hot-toast';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ==================== Sub-Components ====================

function PriorityBadge({ priority }) {
  const map = { URGENT: '🔴 Urgente', HIGH: '🟠 Alta', MEDIUM: '🟡 Média', LOW: '🔵 Baixa' };
  return <span className={`priority-badge ${priority}`}>{map[priority] ?? priority}</span>;
}

function DueDateLabel({ date }) {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  let label = format(d, "dd MMM", { locale: ptBR });
  let cls = '';
  if (isPast(d) && !isToday(d)) { label = `⚠️ ${format(d, "dd/MM")}`; cls = 'overdue'; }
  else if (isToday(d)) { label = '📅 Hoje'; cls = 'today'; }
  else if (isTomorrow(d)) { label = '📅 Amanhã'; cls = 'soon'; }
  else label = `📅 ${label}`;
  return <span className={`due-date ${cls}`}>{label}</span>;
}

// ==================== Task Modal ====================

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: '🔵 Baixa' },
  { value: 'MEDIUM', label: '🟡 Média' },
  { value: 'HIGH',   label: '🟠 Alta' },
  { value: 'URGENT', label: '🔴 Urgente' },
];

const STATUS_OPTIONS = [
  { value: 'TODO',        label: '⭕ A Fazer' },
  { value: 'IN_PROGRESS', label: '🔄 Em Progresso' },
  { value: 'DONE',        label: '✅ Concluída' },
];

const PRESET_COLORS = ['#f59e0b','#10b981','#6366f1','#ec4899','#ef4444','#3b82f6','#8b5cf6','#14b8a6'];

function TaskModal({ task, categories, tags, onClose, onSaved }) {
  const isEditing = !!task;

  const [title, setTitle]           = useState(task?.title ?? '');
  const [description, setDesc]      = useState(task?.description ?? '');
  const [dueDate, setDueDate]       = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [priority, setPriority]     = useState(task?.priority ?? 'MEDIUM');
  const [status, setStatus]         = useState(task?.status ?? 'TODO');
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? '');
  const [selectedTags, setSelTags]  = useState(task?.tags?.map((t) => t.id) ?? []);
  const [loading, setLoading]       = useState(false);

  const toggleTag = (id) => setSelTags((prev) =>
    prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Título obrigatório.');
    setLoading(true);
    try {
      const payload = {
        title: title.trim(), description: description.trim(),
        dueDate: dueDate || null, priority, status,
        categoryId: categoryId || null, tagIds: selectedTags,
      };

      if (isEditing) {
        await tasksApi.update(task.id, payload);
        toast.success('Tarefa atualizada!');
      } else {
        await tasksApi.create(payload);
        toast.success('Tarefa criada! ✨');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar tarefa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEditing ? '✏️ Editar Tarefa' : '✨ Nova Tarefa'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} id="task-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Título *</label>
              <input
                id="task-title"
                className="form-input"
                placeholder="O que precisa ser feito?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Descrição</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Detalhes, contexto, links..."
                value={description}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Data Limite</label>
                <input
                  id="task-due"
                  className="form-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Prioridade</label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="task-category">Categoria</label>
              <select
                id="task-category"
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {tags.length > 0 && (
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-chip ${selectedTags.includes(tag.id) ? 'tag-removable' : ''}`}
                      onClick={() => toggleTag(tag.id)}
                      style={selectedTags.includes(tag.id) ? {} : {}}
                    >
                      # {tag.name}
                      {selectedTags.includes(tag.id) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="task-save-btn">
              {loading ? <><span className="spinner" /> Salvando...</> : isEditing ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Category Modal ====================

function CategoryModal({ onClose, onSaved }) {
  const [name, setName]   = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nome obrigatório.');
    setLoading(true);
    try {
      await categoriesApi.create({ name: name.trim(), color });
      toast.success('Categoria criada!');
      onSaved();
      onClose();
    } catch {
      toast.error('Erro ao criar categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h2 className="modal-title">🏷️ Nova Categoria</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name">Nome</label>
              <input id="cat-name" className="form-input" placeholder="ex: Trabalho" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <div className="color-options">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c} type="button"
                    className={`color-dot ${color === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="cat-save-btn">
              {loading ? <span className="spinner" /> : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Tag Modal ====================

function TagModal({ onClose, onSaved }) {
  const [name, setName]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await tagsApi.create({ name: name.trim() });
      toast.success('Tag criada!');
      onSaved();
      onClose();
    } catch {
      toast.error('Erro ao criar tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 340 }}>
        <div className="modal-header">
          <h2 className="modal-title"># Nova Tag</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="tag-name">Nome da tag</label>
              <input id="tag-name" className="form-input" placeholder="ex: importante" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="tag-save-btn">
              {loading ? <span className="spinner" /> : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Main Page ====================

const PRIORITY_FILTERS = [
  { label: 'Todas', value: '' },
  { label: '🔴 Urgente', value: 'URGENT' },
  { label: '🟠 Alta', value: 'HIGH' },
  { label: '🟡 Média', value: 'MEDIUM' },
  { label: '🔵 Baixa', value: 'LOW' },
];

const STATUS_FILTERS = [
  { label: 'Pendentes', value: 'TODO' },
  { label: 'Em Progresso', value: 'IN_PROGRESS' },
  { label: 'Concluídas', value: 'DONE' },
  { label: 'Todas', value: '' },
];

export default function TasksPage() {
  const [tasks, setTasks]             = useState([]);
  const [categories, setCategories]   = useState([]);
  const [tags, setTags]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterPriority, setFP]       = useState('');
  const [filterStatus, setFS]         = useState('TODO');
  const [filterCategory, setFC]       = useState('');
  const [modalTask, setModalTask]     = useState(undefined); // undefined=closed, null=new, task=edit
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, catsRes, tagsRes] = await Promise.all([
        tasksApi.getAll({
          status:     filterStatus     || undefined,
          priority:   filterPriority   || undefined,
          categoryId: filterCategory   || undefined,
          search:     search           || undefined,
        }),
        categoriesApi.getAll(),
        tagsApi.getAll(),
      ]);
      setTasks(tasksRes.data.tasks);
      setCategories(catsRes.data.categories);
      setTags(tagsRes.data.tags);
    } catch (e) {
      toast.error('Erro ao carregar dados.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterCategory, search]);

  useEffect(() => {
    const timer = setTimeout(fetchAll, 300);
    return () => clearTimeout(timer);
  }, [fetchAll]);

  const handleComplete = async (id) => {
    try {
      await tasksApi.complete(id);
      fetchAll();
    } catch {
      toast.error('Erro ao atualizar tarefa.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deletar esta tarefa?')) return;
    try {
      await tasksApi.remove(id);
      toast.success('Tarefa deletada.');
      fetchAll();
    } catch {
      toast.error('Erro ao deletar.');
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">✅ Minhas Tarefas</div>
          <div className="topbar-subtitle">{tasks.length} tarefas encontradas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCatModal(true)} id="new-category-btn">
            🏷️ Categoria
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTagModal(true)} id="new-tag-btn">
            # Tag
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModalTask(null)} id="new-task-btn">
            + Nova Tarefa
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* Filter Bar */}
        <div className="filter-bar">
          {/* Search */}
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              id="task-search"
              placeholder="Buscar tarefas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status */}
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-chip ${filterStatus === f.value ? 'active' : ''}`}
              onClick={() => setFS(f.value)}
              id={`filter-status-${f.value || 'all'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="filter-bar" style={{ marginTop: -16 }}>
          {/* Priority */}
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-chip ${filterPriority === f.value ? 'active' : ''}`}
              onClick={() => setFP(f.value)}
              id={`filter-priority-${f.value || 'all'}`}
            >
              {f.label}
            </button>
          ))}

          {/* Categories */}
          {categories.length > 0 && (
            <select
              className="filter-chip"
              style={{ cursor: 'pointer', border: filterCategory ? '1px solid var(--accent-500)' : undefined }}
              value={filterCategory}
              onChange={(e) => setFC(e.target.value)}
              id="filter-category"
            >
              <option value="">📂 Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">Nenhuma tarefa aqui</div>
            <p className="empty-text">
              {search ? `Nenhum resultado para "${search}"` : 'Crie sua primeira tarefa e comece a organizar sua vida!'}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setModalTask(null)} id="empty-new-task-btn">
              + Criar tarefa
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-card animate-in ${task.status === 'DONE' ? 'done' : ''} ${task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && task.status !== 'DONE' ? 'overdue' : ''}`}
              >
                <button
                  className={`task-checkbox ${task.status === 'DONE' ? 'checked' : ''}`}
                  onClick={() => handleComplete(task.id)}
                  aria-label="Marcar como concluída"
                />
                <div className="task-body">
                  <div className={`task-title ${task.status === 'DONE' ? 'done' : ''}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  <div className="task-meta">
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && <DueDateLabel date={task.dueDate} />}
                    {task.category && (
                      <span className="category-badge" style={{
                        background: task.category.color + '22',
                        color: task.category.color,
                      }}>
                        {task.category.name}
                      </span>
                    )}
                    {task.tags?.map((tag) => (
                      <span key={tag.id} className="tag-chip"># {tag.name}</span>
                    ))}
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setModalTask(task)}
                    title="Editar"
                    aria-label="Editar tarefa"
                  >✏️</button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleDelete(task.id)}
                    title="Deletar"
                    aria-label="Deletar tarefa"
                    style={{ color: 'var(--danger)' }}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          categories={categories}
          tags={tags}
          onClose={() => setModalTask(undefined)}
          onSaved={fetchAll}
        />
      )}
      {showCatModal && (
        <CategoryModal onClose={() => setShowCatModal(false)} onSaved={fetchAll} />
      )}
      {showTagModal && (
        <TagModal onClose={() => setShowTagModal(false)} onSaved={fetchAll} />
      )}
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { statsApi, tasksApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ icon, value, label, variant = 'accent' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function CompletionRing({ pct }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="completion-ring-container">
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="var(--accent-500)"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="completion-ring-label">
        <span className="completion-pct">{pct}%</span>
        <span className="completion-text">Completo</span>
      </div>
    </div>
  );
}

function DueDateLabel({ date }) {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  let label = format(d, "dd MMM", { locale: ptBR });
  let cls = '';
  if (isPast(d) && !isToday(d)) { label = `Atrasado · ${format(d, "dd/MM")}`; cls = 'overdue'; }
  else if (isToday(d)) { label = 'Hoje'; cls = 'today'; }
  else if (isTomorrow(d)) { label = 'Amanhã'; cls = 'soon'; }

  return <span className={`due-date ${cls}`}>📅 {label}</span>;
}

function PriorityBadge({ priority }) {
  const map = { URGENT: '🔴 Urgente', HIGH: '🟠 Alta', MEDIUM: '🟡 Média', LOW: '🔵 Baixa' };
  return <span className={`priority-badge ${priority}`}>{map[priority] ?? priority}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] ?? '';

  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, urgentRes, overdueRes] = await Promise.all([
        statsApi.get(),
        tasksApi.getAll({ priority: 'URGENT', status: 'TODO' }),
        tasksApi.getAll({ status: 'TODO' }),
      ]);
      setStats(statsRes.data);
      setUrgentTasks(urgentRes.data.tasks.slice(0, 5));

      const now = new Date();
      const overdue = overdueRes.data.tasks
        .filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))
        .slice(0, 5);
      setOverdueTasks(overdue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComplete = async (id) => {
    await tasksApi.complete(id);
    fetchData();
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">{greeting}, {firstName}! 👋</div>
          <div className="topbar-subtitle">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
        <Link to="/tasks" className="btn btn-primary btn-sm" id="new-task-topbar-btn">
          + Nova Tarefa
        </Link>
      </div>

      <div className="page-container">
        {/* Stat Cards */}
        {loadingStats ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : (
          <div className="stat-cards-grid">
            <StatCard icon="📋" value={stats?.total}          label="Total de Tarefas"    variant="accent" />
            <StatCard icon="✅" value={stats?.completedToday} label="Concluídas Hoje"      variant="success" />
            <StatCard icon="⏰" value={stats?.overdue}         label="Tarefas Atrasadas"   variant="danger" />
            <StatCard icon="🔥" value={stats?.urgent}          label="Urgentes"            variant="warning" />
            <StatCard icon="📌" value={stats?.pending}         label="Pendentes"           variant="info" />
          </div>
        )}

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Urgent Tasks */}
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">🔥 Tarefas Urgentes</div>
                <div className="section-subtitle">Precisam de atenção imediata</div>
              </div>
              <Link to="/tasks?priority=URGENT" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Nenhuma tarefa urgente. Excelente!
                </p>
              </div>
            ) : (
              <div className="tasks-list">
                {urgentTasks.map((task) => (
                  <div key={task.id} className={`task-card ${task.status === 'DONE' ? 'done' : ''}`}>
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
                          <span
                            className="category-badge"
                            style={{
                              background: task.category.color + '22',
                              color: task.category.color,
                            }}
                          >
                            {task.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <>
                <div className="section-header" style={{ marginTop: 40 }}>
                  <div>
                    <div className="section-title">⏰ Tarefas Atrasadas</div>
                    <div className="section-subtitle">Passaram do prazo</div>
                  </div>
                </div>
                <div className="tasks-list">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="task-card overdue">
                      <button
                        className={`task-checkbox ${task.status === 'DONE' ? 'checked' : ''}`}
                        onClick={() => handleComplete(task.id)}
                        aria-label="Marcar como concluída"
                      />
                      <div className="task-body">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <PriorityBadge priority={task.priority} />
                          <DueDateLabel date={task.dueDate} />
                          {task.category && (
                            <span className="category-badge" style={{ background: task.category.color + '22', color: task.category.color }}>
                              {task.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Progress + Recent Done */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Completion Ring Card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="section-title" style={{ marginBottom: 20 }}>Taxa de Conclusão</div>
              {stats && <CompletionRing pct={stats.completionRate ?? 0} />}
              <div className="progress-bar" style={{ marginTop: 16 }}>
                <div className="progress-fill" style={{ width: `${stats?.completionRate ?? 0}%` }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
                {stats?.done} de {stats?.total} tarefas concluídas
              </p>
            </div>

            {/* Recently Completed */}
            {stats?.recentDone?.length > 0 && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>✅ Concluídas Recentemente</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.recentDone.map((t) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.8125rem', fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          textDecoration: 'line-through', color: 'var(--text-muted)'
                        }}>{t.title}</div>
                        {t.completedAt && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>
                            {format(parseISO(t.completedAt), "dd/MM 'às' HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/tasks" className="btn btn-primary" style={{ justifyContent: 'center' }} id="go-to-tasks-btn">
              Ver todas as tarefas →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

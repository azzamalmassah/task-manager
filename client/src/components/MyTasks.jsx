import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Zap, Calendar, CheckCircle2, ChevronDown, MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { createTask, getTasks, updateTask } from '../lib/taskApi';

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  review: 'Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

const priorityClasses = {
  low: 'bg-surface-container-high text-on-surface-variant',
  medium: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-50 text-orange-600',
  critical: 'bg-red-50 text-red-600',
};

function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dueDate));
}

export default function MyTasks({ token, user }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoading(true);
      setError('');
      try {
        const nextTasks = await getTasks(token);
        if (isMounted) setTasks(nextTasks);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (token) loadTasks();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && task.status !== 'done') ||
        (filter === 'done' && task.status === 'done');
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, tasks]);

  const activeCount = tasks.filter((task) => task.status !== 'done').length;
  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const dueSoonCount = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueTime = new Date(task.dueDate).getTime();
    const dayFromNow = Date.now() + 24 * 60 * 60 * 1000;
    return dueTime <= dayFromNow;
  }).length;

  const toggleTask = async (id) => {
    const currentTask = tasks.find((task) => task._id === id);
    if (!currentTask) return;

    const nextStatus = currentTask.status === 'done' ? 'todo' : 'done';
    setTasks((current) => current.map((task) => (task._id === id ? { ...task, status: nextStatus } : task)));

    try {
      const savedTask = await updateTask(token, id, { status: nextStatus });
      setTasks((current) => current.map((task) => (task._id === id ? savedTask : task)));
    } catch (err) {
      setTasks((current) => current.map((task) => (task._id === id ? currentTask : task)));
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    const currentTask = tasks.find((task) => task._id === id);
    if (!currentTask) return;

    setTasks((current) => current.map((task) => (task._id === id ? { ...task, status } : task)));

    try {
      const savedTask = await updateTask(token, id, { status });
      setTasks((current) => current.map((task) => (task._id === id ? savedTask : task)));
    } catch (err) {
      setTasks((current) => current.map((task) => (task._id === id ? currentTask : task)));
      setError(err.message);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!newTask.title.trim()) return;

    setIsCreating(true);
    setError('');

    try {
      const task = await createTask(token, {
        ...newTask,
        title: newTask.title.trim(),
        dueDate: newTask.dueDate || undefined,
      });
      setTasks((current) => [task, ...current]);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const avatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA_7nLO2YCGtEON3f7oStnO8VoY0E04qdz_j2UbtIpvOerBcj-z2pGw0XVPeA5yuK-Y6Yo663_dm_8dES9wW5JMIpiihZ0hxZ0exDuNgjf1bVD8zlhUHzNC0vrvPPpm_nlnbh9azIfB3cbHeCutcYBIu75rLlT3waotNPUix9iEZ6i8zxVzPPa1tyiZSrqMHGVLnLmi5v7TQSw5dXfOOMv-RHicFJ-hCQOPKr6VdkvfsOM6gAS4Q7RkOQh3e53AFAOgTQFky5vG9A',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyPXaXjXCX-W_7NaxXJCNOjJ3VE3FxMchoTpDhz_ItLm4bqyVBXflQrs3QGnNUdvUO7mK1Il8sHONVoY6ZccnstTM5i-iRPc1v2UPB2N8i9EAgA_CSL0hydh7kLMEWhZWcFS3vXOVof9R2eDHtTbURPmNViHLnrcJhMCuY64jv6nsJQgJsuabjqY4iDafNXwrVjCvqRu6mBFKS_2ghIVTTqVbpT6bcaPN2Rs7NwmgulbrHC0piBNIuj9t3FUXaCT-aFckKKjZC-Q',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAT4icEOGOZssSnpxTpWGCDDFnOrAbZF6d_Lxq0AGyPFIQgaMXVY0P7iMdbooQ_JeA3NgcZ2Lro-2ENj3Zgih2I7TZSOSI6t0HrqU0Lt5tmD-O5MT4n4V4X_vBI51fPfnCcpw1un1slHj9IxPQHulJa_1UFjdG2K3jSDlT9DRoSrKGwe1PQRawbf9YNvv-MSluICxSj3FTsZMHigAEAjVykCGmr2NPqgNbcpeO3_1VGqPjd5R8O_sP-0733tVroXVBl9-tDNrWyGQ'
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Bento Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-8 flex flex-col justify-between border border-outline-variant shadow-sm">
          <div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'there'}</h3>
            <p className="text-on-surface-variant font-medium max-w-md">You have {activeCount} active tasks in your queue. This view is now powered by your backend task routes.</p>
          </div>
          <div className="mt-8 flex gap-4 flex-wrap">
            <StatPill label="COMPLETED" value={String(completedCount).padStart(2, '0')} />
            <StatPill label="ACTIVE" value={String(activeCount).padStart(2, '0')} />
            <StatPill label="DUE SOON" value={String(dueSoonCount).padStart(2, '0')} />
          </div>
        </div>
        <div className="lg:col-span-4 bg-primary-container text-white p-8 rounded-2xl flex flex-col justify-between border border-primary relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <Zap className="text-secondary w-6 h-6 mb-6 fill-secondary" />
            <h4 className="text-lg font-bold mb-1">Next Deadline</h4>
            <p className="text-[10px] font-black tracking-widest uppercase opacity-70">{tasks.find((task) => task.dueDate && task.status !== 'done')?.title || 'No active deadlines'}</p>
          </div>
          <div className="relative z-10 mt-8">
            <span className="text-3xl font-black">2h 45m</span>
            <div className="w-full bg-on-primary-fixed-variant/40 h-1 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '66%' }}
                className="bg-secondary h-full rounded-full" 
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-secondary shadow-[0_0_100px_rgba(0,100,255,0.2)] rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Tasks</FilterButton>
          <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>Active</FilterButton>
          <FilterButton active={filter === 'done'} onClick={() => setFilter('done')}>Completed</FilterButton>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input 
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:ring-1 focus:ring-secondary outline-none transition-all w-full md:w-64" 
              placeholder="Search tasks..." 
              type="text" 
            />
          </div>
          <button
            type="submit"
            form="new-task-form"
            disabled={isCreating}
            className="bg-black text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      <form id="new-task-form" onSubmit={handleCreateTask} className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:grid-cols-[1fr_180px_190px]">
        <input
          value={newTask.title}
          onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))}
          className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
          placeholder="Task title"
          minLength={3}
          maxLength={50}
        />
        <select
          value={newTask.priority}
          onChange={(event) => setNewTask((current) => ({ ...current, priority: event.target.value }))}
          className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
          <option value="critical">Critical priority</option>
        </select>
        <input
          value={newTask.dueDate}
          onChange={(event) => setNewTask((current) => ({ ...current, dueDate: event.target.value }))}
          className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
          type="datetime-local"
        />
        <textarea
          value={newTask.description}
          onChange={(event) => setNewTask((current) => ({ ...current, description: event.target.value }))}
          className="min-h-20 rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary md:col-span-3"
          placeholder="Description"
        />
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-sm font-bold text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading tasks
          </div>
        )}

        {!isLoading && visibleTasks.length === 0 && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm font-bold text-on-surface-variant">
            No tasks found.
          </div>
        )}

        {visibleTasks.map((task, idx) => (
          <motion.div 
            key={task._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "bg-surface-container-lowest border border-outline-variant p-6 flex flex-col md:flex-row md:items-center justify-between transition-all group relative rounded-2xl shadow-sm hover:shadow-md",
              task.status === 'done' ? "opacity-60 grayscale-[0.2]" : ""
            )}
          >
            {task.status !== 'done' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>}
            
            <div className="flex items-start gap-4 mb-4 md:mb-0">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={task.status === 'done'}
                  onChange={() => toggleTask(task._id)}
                  className="w-5 h-5 rounded-md border-outline-variant text-secondary focus:ring-secondary cursor-pointer" 
                />
              </div>
              <div>
                <h5 className={cn("text-base font-bold text-on-surface transition-colors", task.status === 'done' ? "line-through opacity-70" : "group-hover:text-secondary")}>
                  {task.title}
                </h5>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className={cn(
                    "font-black text-[9px] tracking-widest px-2 py-0.5 rounded-full uppercase",
                    priorityClasses[task.priority] || priorityClasses.medium
                  )}>
                    {task.priority || 'medium'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                    {task.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 fill-green-500 text-white" /> : <Calendar className="w-3.5 h-3.5" />}
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
                {task.description && <p className="mt-2 max-w-xl text-sm font-medium text-on-surface-variant">{task.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-surface-container-high text-[10px] font-black text-secondary">
                  {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="relative inline-block w-40">
                <select 
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className={cn(
                    "w-full rounded-xl py-1.5 px-3 text-[10px] font-black tracking-widest uppercase appearance-none cursor-pointer border-none outline-none focus:ring-1 focus:ring-secondary shadow-sm",
                    task.status === 'done' ? "bg-secondary text-white" : "bg-surface-container-low text-on-surface"
                  )}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className={cn("absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none", task.status === 'done' ? "text-white" : "text-on-surface-variant")} />
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="bg-surface-container-lowest px-6 py-3 border border-outline-variant rounded-xl shadow-sm">
      <span className="font-black text-[9px] tracking-widest text-on-surface-variant block mb-1 uppercase opacity-70">{label}</span>
      <span className="text-2xl font-black text-on-surface leading-none">{value}</span>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl font-bold text-sm transition-colors",
        active ? "bg-secondary text-white" : "hover:bg-surface-container-high text-on-surface-variant"
      )}
    >
      {children}
    </button>
  );
}

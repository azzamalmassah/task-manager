import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Timer, ShieldAlert, Eye, Edit3, Trash2, CheckCircle2, Users, Loader2, ListTodo } from 'lucide-react';
import { cn } from '../lib/utils';
import { createTask, deleteTask, getTasks, updateTask } from '../lib/taskApi';
import { getUsers } from '../lib/userApi';

const TASKS_PER_PAGE = 5;

const statusLabels = {
  todo: 'TO DO',
  'in-progress': 'IN PROGRESS',
  blocked: 'BLOCKED',
  review: 'REVIEW',
  done: 'DONE',
  cancelled: 'CANCELLED',
};

const statusProgress = {
  todo: 10,
  'in-progress': 60,
  blocked: 25,
  review: 85,
  done: 100,
  cancelled: 0,
};

function formatDate(date) {
  if (!date) return 'No due date';

  const dueDate = new Date(date);
  if (Number.isNaN(dueDate.getTime())) return 'No due date';

  if (dueDate.getTime() < Date.now()) return 'Overdue';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dueDate);
}

function isCritical(task) {
  return task.priority === 'critical' || task.status === 'blocked' || (task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== 'done');
}

function toDateTimeLocalValue(date) {
  if (!date) return '';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function getMinimumDueDate() {
  return toDateTimeLocalValue(new Date());
}

function isPastDueDate(date) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

function getPersonId(person) {
  if (!person) return 'Unassigned';
  return typeof person === 'string' ? person : person._id || person.id;
}

function getPersonName(person, users = [], currentUser) {
  if (!person) return 'Unassigned';
  if (typeof person !== 'string' && (person.name || person.email)) {
    return person.name || person.email;
  }

  const personId = getPersonId(person);
  const matchedUser = users.find((availableUser) => (availableUser._id || availableUser.id) === personId);
  if (matchedUser) return matchedUser.name || matchedUser.email || 'Unassigned';

  if ((currentUser?._id || currentUser?.id) === personId) {
    return currentUser.name || currentUser.email || 'Current user';
  }

  return 'Unassigned';
}

export default function Dashboard({ token, user }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });
  const [error, setError] = useState('');
  const [userLoadError, setUserLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canManageTasks = user?.role === 'admin' || user?.role === 'department-manager';

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!token) {
        setTasks([]);
        setError('Please log in to load tasks from the database.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const nextTasks = await getTasks(token, { page, limit: TASKS_PER_PAGE });
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
  }, [page, refreshKey, token]);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (!token || !canManageTasks) return;

      setIsLoadingUsers(true);
      setUserLoadError('');

      try {
        const nextUsers = await getUsers(token);
        if (isMounted) {
          setUsers(nextUsers);
          setCreateForm((current) => ({
            ...current,
            assignedTo: current.assignedTo || nextUsers[0]?._id || '',
          }));
        }
      } catch (err) {
        if (isMounted) setUserLoadError(err.message);
      } finally {
        if (isMounted) setIsLoadingUsers(false);
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [canManageTasks, token]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = (task.title || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, tasks]);

  const overdueCount = tasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() < Date.now() && task.status !== 'done').length;
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress').length;
  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const nextDeadline = tasks
    .filter((task) => task.dueDate && task.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const startEditingTask = (task) => {
    setExpandedTaskId(task._id);
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueDate: toDateTimeLocalValue(task.dueDate),
      assignedTo: getPersonId(task.assignedTo) === 'Unassigned' ? '' : getPersonId(task.assignedTo),
    });
  };

  const submitNewTask = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      if (isPastDueDate(createForm.dueDate)) {
        throw new Error('Due date cannot be in the past.');
      }

      const creatorId = user?._id || user?.id;
      if (!creatorId) {
        throw new Error('Could not identify the logged-in user. Please log in again.');
      }

      const savedTask = await createTask(token, {
        title: createForm.title.trim(),
        description: createForm.description,
        status: createForm.status,
        priority: createForm.priority,
        dueDate: createForm.dueDate || undefined,
        createdBy: creatorId,
        assignedTo: createForm.assignedTo || undefined,
      });

      if (page === 1) {
        setRefreshKey((current) => current + 1);
      } else {
        setPage(1);
      }
      setCreateForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assignedTo: users[0]?._id || '',
      });
      setIsCreateOpen(false);
      setExpandedTaskId(savedTask?._id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const saveTask = async (event, taskId) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (isPastDueDate(editForm.dueDate)) {
        throw new Error('Due date cannot be in the past.');
      }

      const savedTask = await updateTask(token, taskId, {
        ...editForm,
        dueDate: editForm.dueDate || undefined,
        assignedTo: editForm.assignedTo || undefined,
      });
      setTasks((current) => current.map((task) => (task._id === taskId ? savedTask : task)));
      setEditingTaskId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeTask = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;

    setError('');

    try {
      await deleteTask(token, taskId);
      if (expandedTaskId === taskId) setExpandedTaskId(null);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black mb-1">Active Tasks</h2>
          <p className="text-sm font-medium text-on-surface-variant">Manage and monitor ongoing operational workflows.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant w-4 h-4" />
            <input 
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:border-secondary transition-all text-sm font-medium" 
              placeholder="Search tasks..." 
              type="text" 
            />
          </div>
          <button
            disabled={!canManageTasks}
            onClick={() => setIsCreateOpen((current) => !current)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl transition-opacity font-bold text-sm",
              canManageTasks ? "bg-primary text-on-primary hover:opacity-90" : "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
            )}
            title={canManageTasks ? "Create task" : "Only admins and department managers can create tasks"}
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Stats Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">Quick Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-black tracking-widest text-on-surface-variant block mb-2">OVERDUE</span>
                <div className="text-4xl font-black text-red-600">{String(overdueCount).padStart(2, '0')}</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-black tracking-widest text-on-surface-variant block mb-2">IN PROGRESS</span>
                <div className="text-4xl font-black text-secondary">{String(inProgressCount).padStart(2, '0')}</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                <span className="text-[10px] font-black tracking-widest text-on-surface-variant block mb-2">COMPLETED</span>
                <div className="text-4xl font-black text-green-600">{String(completedCount).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
          <div className="bg-primary-container text-white p-6 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Next Deadline</h3>
              <p className="opacity-80 text-sm font-medium mb-4">{nextDeadline?.title || 'No upcoming deadline'}</p>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-secondary" />
                <span className="text-xs font-black tracking-wider uppercase">{formatDate(nextDeadline?.dueDate)}</span>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Timer className="w-40 h-40 font-black" />
            </div>
          </div>
        </div>

        {/* Right Task List Column */}
        <div className="lg:col-span-8 space-y-4">
          {isCreateOpen && (
            <form onSubmit={submitNewTask} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-1">
                <h3 className="text-lg font-black">Create Task</h3>
                <p className="text-sm font-medium text-on-surface-variant">
                  Created by <span className="font-black text-on-surface">{user?.name || user?.email || 'Current user'}</span>
                </p>
              </div>

              {userLoadError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {userLoadError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField label="Task title" wide>
                  <input
                    value={createForm.title}
                    onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                    placeholder="Task title"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </FormField>
                <FormField label="Assign to">
                  <select
                    value={createForm.assignedTo}
                    onChange={(event) => setCreateForm((current) => ({ ...current, assignedTo: event.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                    disabled={isLoadingUsers}
                  >
                    <option value="">{isLoadingUsers ? 'Loading users...' : 'Unassigned'}</option>
                    {users.map((availableUser) => (
                      <option key={availableUser._id} value={availableUser._id}>
                        {availableUser.name} - {availableUser.department}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Created by">
                  <input
                    value={user?.name || user?.email || 'Current user'}
                    className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface-variant outline-none"
                    readOnly
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    value={createForm.status}
                    onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="review">Review</option>
                    <option value="done">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </FormField>
                <FormField label="Priority">
                  <select
                    value={createForm.priority}
                    onChange={(event) => setCreateForm((current) => ({ ...current, priority: event.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                    <option value="critical">Critical priority</option>
                  </select>
                </FormField>
                <FormField label="Due date" wide>
                  <input
                    value={createForm.dueDate}
                    onChange={(event) => setCreateForm((current) => ({ ...current, dueDate: event.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                    type="datetime-local"
                    min={getMinimumDueDate()}
                  />
                </FormField>
                <FormField label="Description" wide>
                  <textarea
                    value={createForm.description}
                    onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                    className="min-h-24 rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                    placeholder="Description"
                  />
                </FormField>
                <div className="flex justify-end gap-2 md:col-span-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">
                    Cancel
                  </button>
                  <button type="submit" disabled={isCreating} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                    {isCreating ? 'Creating...' : 'Create task'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="flex items-center gap-3 pb-2 overflow-x-auto no-scrollbar">
            <StatusTab active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              All Tasks
            </StatusTab>
            <StatusTab active={statusFilter === 'todo'} onClick={() => setStatusFilter('todo')}>
              To Do
            </StatusTab>
            <StatusTab active={statusFilter === 'in-progress'} onClick={() => setStatusFilter('in-progress')}>
              In Progress
            </StatusTab>
            <StatusTab active={statusFilter === 'review'} onClick={() => setStatusFilter('review')}>
              Review
            </StatusTab>
            <StatusTab active={statusFilter === 'blocked'} onClick={() => setStatusFilter('blocked')}>
              Blocked
            </StatusTab>
            <StatusTab active={statusFilter === 'done'} onClick={() => setStatusFilter('done')}>
              Completed
            </StatusTab>
          </div>

          <div className="space-y-3">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-sm font-bold text-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading tasks
              </div>
            )}

            {!isLoading && !error && visibleTasks.length === 0 && (
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm font-bold text-on-surface-variant">
                No tasks found.
              </div>
            )}

            {!isLoading && !error && visibleTasks.map((task, idx) => {
              const critical = isCritical(task);
              const status = statusLabels[task.status] || task.status?.toUpperCase() || 'TO DO';
              const progress = statusProgress[task.status] ?? 10;

              return (
              <motion.div 
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setExpandedTaskId((current) => (current === task._id ? null : task._id))}
                className="group cursor-pointer p-6 bg-surface-container-lowest border border-outline-variant hover:border-secondary transition-all duration-200 rounded-2xl relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity", critical ? "bg-red-600" : "bg-secondary")}></div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="flex flex-col items-center justify-center h-12 w-12 bg-surface-container rounded-xl border border-outline-variant flex-shrink-0">
                      {critical ? <ShieldAlert className="text-red-500 w-6 h-6" /> : <ListTodo className="text-secondary w-6 h-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-base font-bold truncate">{task.title}</h4>
                        <span className={cn("px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded border", 
                          critical ? "bg-red-50 text-red-700 border-red-200" : "bg-surface-container-high text-on-surface-variant border-outline-variant")}>
                          {task.priority || 'medium'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {getPersonName(task.assignedTo || task.createdBy, users, user)}
                        </span>
                        <span className={cn("flex items-center gap-1", critical ? "text-red-600" : "")}>
                          {critical ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end gap-1.5">
                      <span className={cn("px-3 py-1 text-[10px] font-black rounded-full", 
                        task.status === 'in-progress' ? "bg-blue-50 text-blue-700" : 
                        critical ? "bg-red-50 text-red-700" : 
                        "bg-surface-container-high text-on-surface-variant")}>
                        {status}
                      </span>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", critical ? "bg-red-600" : "bg-secondary")} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100" onClick={(event) => event.stopPropagation()}>
                      <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors" title="View details" onClick={() => setExpandedTaskId((current) => (current === task._id ? null : task._id))}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        disabled={!canManageTasks}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          canManageTasks ? "text-on-surface-variant hover:bg-surface-container" : "cursor-not-allowed text-outline-variant"
                        )}
                        title={canManageTasks ? "Update task" : "Only admins and department managers can update tasks"}
                        onClick={() => canManageTasks && startEditingTask(task)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        disabled={!canManageTasks}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          canManageTasks ? "text-on-surface-variant hover:bg-red-50 hover:text-red-700" : "cursor-not-allowed text-outline-variant"
                        )}
                        title={canManageTasks ? "Delete task" : "Only admins and department managers can delete tasks"}
                        onClick={() => canManageTasks && removeTask(task._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedTaskId === task._id && (
                  <div className="mt-6 border-t border-outline-variant pt-5" onClick={(event) => event.stopPropagation()}>
                    {editingTaskId === task._id ? (
                      <form onSubmit={(event) => saveTask(event, task._id)} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField label="Task title" wide>
                          <input
                            value={editForm.title}
                            onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                            className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                            placeholder="Task title"
                            required
                            minLength={3}
                            maxLength={50}
                          />
                        </FormField>
                        <FormField label="Status">
                          <select
                            value={editForm.status}
                            onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
                            className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="review">Review</option>
                            <option value="done">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </FormField>
                        <FormField label="Priority">
                          <select
                            value={editForm.priority}
                            onChange={(event) => setEditForm((current) => ({ ...current, priority: event.target.value }))}
                            className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                          >
                            <option value="low">Low priority</option>
                            <option value="medium">Medium priority</option>
                            <option value="high">High priority</option>
                            <option value="critical">Critical priority</option>
                          </select>
                        </FormField>
                        <FormField label="Assign to" wide>
                          <select
                            value={editForm.assignedTo}
                            onChange={(event) => setEditForm((current) => ({ ...current, assignedTo: event.target.value }))}
                            className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                            disabled={isLoadingUsers}
                          >
                            <option value="">{isLoadingUsers ? 'Loading users...' : 'Unassigned'}</option>
                            {users.map((availableUser) => (
                              <option key={availableUser._id} value={availableUser._id}>
                                {availableUser.name} - {availableUser.department}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Due date" wide>
                          <input
                            value={editForm.dueDate}
                            onChange={(event) => setEditForm((current) => ({ ...current, dueDate: event.target.value }))}
                            className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary"
                            type="datetime-local"
                            min={getMinimumDueDate()}
                          />
                        </FormField>
                        <FormField label="Description" wide>
                          <textarea
                            value={editForm.description}
                            onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                            className="min-h-24 rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                            placeholder="Description"
                          />
                        </FormField>
                        <div className="flex justify-end gap-2 md:col-span-2">
                          <button type="button" onClick={() => setEditingTaskId(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">
                            Cancel
                          </button>
                          <button type="submit" disabled={isSaving} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                            {isSaving ? 'Saving...' : 'Save changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <DetailItem label="Description" value={task.description || 'No description'} wide />
                        <DetailItem label="Status" value={status} />
                        <DetailItem label="Priority" value={task.priority || 'medium'} />
                        <DetailItem label="Due date" value={formatDate(task.dueDate)} />
                        <DetailItem label="Created" value={formatDate(task.createdAt)} />
                        <DetailItem label="Created by" value={getPersonName(task.createdBy, users, user)} />
                        <DetailItem label="Assigned to" value={getPersonName(task.assignedTo, users, user)} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest px-6 py-4 shadow-sm">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Page {page} · Showing {visibleTasks.length} tasks
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1 || isLoading}
                onClick={() => {
                  setExpandedTaskId(null);
                  setEditingTaskId(null);
                  setPage((current) => Math.max(1, current - 1));
                }}
                className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-black text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                PREV
              </button>
              <button className="h-8 min-w-8 rounded-lg bg-primary px-3 text-xs font-black text-on-primary">
                {page}
              </button>
              <button
                disabled={isLoading || tasks.length < TASKS_PER_PAGE}
                onClick={() => {
                  setExpandedTaskId(null);
                  setEditingTaskId(null);
                  setPage((current) => current + 1);
                }}
                className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-black text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, wide }) {
  return (
    <div className={cn("rounded-lg bg-surface-container-low px-4 py-3", wide ? "md:col-span-2" : "")}>
      <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <span className="mt-1 block break-words text-sm font-bold text-on-surface">{value}</span>
    </div>
  );
}

function FormField({ label, children, wide }) {
  return (
    <label className={cn("flex flex-col gap-2", wide ? "md:col-span-2" : "")}>
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function StatusTab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
        active
          ? "bg-secondary text-white"
          : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"
      )}
    >
      {children}
    </button>
  );
}

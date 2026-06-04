import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Search, Users, ShieldCheck, Clock, Lock, Eye, Edit3, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../lib/userApi';

const USERS_PER_PAGE = 5;

const departments = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Customer Support',
  'Product Management',
  'Design',
  'QA',
  'Administration',
  'IT',
];

const roles = ['admin', 'department-manager', 'employee', 'user'];

const initialForm = {
  name: '',
  email: '',
  role: 'user',
  department: 'Engineering',
  password: '',
  passwordConfirm: '',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
}

function getPersonId(person) {
  if (!person) return '';
  return typeof person === 'string' ? person : person._id || person.id || '';
}

function getPersonName(person, users = [], currentUser) {
  const personId = getPersonId(person);
  if (!personId && typeof person !== 'object') return 'Unknown';
  if (person && typeof person === 'object' && (person.name || person.email)) return person.name || person.email;

  const matchedUser = users.find((user) => (user._id || user.id) === personId);
  if (matchedUser) return matchedUser.name || matchedUser.email || 'Unknown';

  if ((currentUser?._id || currentUser?.id) === personId) return currentUser.name || currentUser.email || 'Current user';

  return 'Unknown';
}

export default function UserManagement({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'department-manager';

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (!token) {
        setError('Please log in to load users from the database.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const nextUsers = await getUsers(token, { page, limit: USERS_PER_PAGE });
        if (isMounted) setUsers(nextUsers);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [page, refreshKey, token]);

  const visibleUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((user) =>
      [user.name, user.email, user.role, user.department].some((value) => (value || '').toLowerCase().includes(query))
    );
  }, [search, users]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (counts, user) => ({
        ...counts,
        [user.role]: (counts[user.role] || 0) + 1,
      }),
      {}
    );
  }, [users]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingUserId(null);
  };

  const openCreate = () => {
    resetForm();
    setSelectedUser(null);
    setIsCreateOpen((current) => !current);
  };

  const openEdit = (user) => {
    setSelectedUser(null);
    setIsCreateOpen(true);
    setEditingUserId(user._id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      department: user.department || 'Engineering',
      password: '',
      passwordConfirm: '',
    });
  };

  const viewUser = async (userId) => {
    if (selectedUser?._id === userId) {
      setSelectedUser(null);
      return;
    }

    setError('');
    try {
      const user = await getUser(token, userId);
      setSelectedUser(user);
      setIsCreateOpen(false);
      setEditingUserId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        department: form.department,
      };

      if (!editingUserId || form.password) {
        payload.password = form.password;
        payload.passwordConfirm = form.passwordConfirm;
      }

      if (!editingUserId) {
        payload.createdBy = currentUser?._id || currentUser?.id;
      }

      const savedUser = editingUserId
        ? await updateUser(token, editingUserId, payload)
        : await createUser(token, payload);

      setUsers((current) =>
        editingUserId
          ? current.map((user) => (user._id === editingUserId ? savedUser : user))
          : [savedUser, ...current]
      );
      if (!editingUserId) setPage(1);
      resetForm();
      setIsCreateOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const removeUser = async (userId) => {
    const confirmed = window.confirm('Delete this user?');
    if (!confirmed) return;

    setError('');

    try {
      await deleteUser(token, userId);
      if (selectedUser?._id === userId) setSelectedUser(null);
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black mb-1">User Management</h2>
          <p className="text-sm font-medium text-on-surface-variant">Manage team access levels and monitor activity.</p>
        </div>
        <button
          disabled={!canManageUsers}
          onClick={openCreate}
          className={cn(
            "px-6 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform",
            canManageUsers ? "bg-primary text-on-primary hover:opacity-90" : "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
          )}
        >
          <UserPlus className="w-4 h-4" />
          CREATE USER
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="text-secondary w-5 h-5" />} label="TOTAL USERS" value={users.length} />
        <StatCard icon={<ShieldCheck className="text-green-600 w-5 h-5" />} label="ADMINS" value={roleCounts.admin || 0} />
        <StatCard icon={<Clock className="text-orange-600 w-5 h-5" />} label="MANAGERS" value={roleCounts['department-manager'] || 0} />
        <StatCard icon={<Lock className="text-red-600 w-5 h-5" />} label="EMPLOYEES" value={roleCounts.employee || 0} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {isCreateOpen && (
        <form onSubmit={saveUser} className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-black">{editingUserId ? 'Update User' : 'Create User'}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="Name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required minLength={8} maxLength={20} className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary" />
            </FormField>
            <FormField label="Email">
              <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required type="email" className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary" />
            </FormField>
            <FormField label="Role">
              <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary">
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </FormField>
            <FormField label="Department">
              <select value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary">
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </FormField>
            <FormField label={editingUserId ? 'New password' : 'Password'}>
              <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required={!editingUserId} minLength={8} maxLength={30} type="password" className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary" />
            </FormField>
            <FormField label={editingUserId ? 'Confirm new password' : 'Confirm password'}>
              <input value={form.passwordConfirm} onChange={(event) => setForm((current) => ({ ...current, passwordConfirm: event.target.value }))} required={!editingUserId || Boolean(form.password)} minLength={8} maxLength={30} type="password" className="rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-bold outline-none focus:border-secondary" />
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" onClick={() => { setIsCreateOpen(false); resetForm(); }} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                {isSaving ? 'Saving...' : editingUserId ? 'Save changes' : 'Create user'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mb-4 flex items-center justify-end">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant w-4 h-4" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 text-sm font-medium outline-none focus:border-secondary" placeholder="Search users..." />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-outline-variant bg-surface-container-low font-black text-[10px] tracking-widest text-on-surface-variant uppercase">
          <div className="col-span-4">User Identity</div>
          <div className="col-span-2 text-center">Role</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-outline-variant">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 p-8 text-sm font-bold text-on-surface-variant">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading users
            </div>
          )}

          {!isLoading && visibleUsers.length === 0 && (
            <div className="p-8 text-center text-sm font-bold text-on-surface-variant">No users found.</div>
          )}

          {!isLoading && visibleUsers.map((user, idx) => (
            <motion.div 
              key={user._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => viewUser(user._id)}
              className="cursor-pointer p-6 md:px-8 hover:bg-slate-50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high relative flex-shrink-0 border border-outline-variant flex items-center justify-center text-sm font-black text-secondary">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{user.name}</h3>
                    <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">{user.email}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-start md:justify-center">
                  <span className="px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-surface-container-high text-on-surface-variant">
                    {user.role}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm font-bold text-on-surface">{user.department}</p>
                  <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
                    Created by {getPersonName(user.createdBy, users, currentUser)}
                  </p>
                </div>
                <div className="md:col-span-3 flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                  <button onClick={() => viewUser(user._id)} className="p-2 hover:bg-surface-container rounded-lg transition-colors group" title="View Details">
                    <Eye className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
                  </button>
                  <button disabled={!canManageUsers} onClick={() => canManageUsers && openEdit(user)} className="p-2 hover:bg-surface-container rounded-lg transition-colors group disabled:cursor-not-allowed disabled:opacity-40" title="Update">
                    <Edit3 className="w-4 h-4 text-on-surface-variant group-hover:text-secondary" />
                  </button>
                  <button disabled={!canManageUsers} onClick={() => canManageUsers && removeUser(user._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group disabled:cursor-not-allowed disabled:opacity-40" title="Delete">
                    <Trash2 className="w-4 h-4 text-on-surface-variant group-hover:text-red-700" />
                  </button>
                </div>
              </div>

              {selectedUser?._id === user._id && (
                <div className="mt-5 border-t border-outline-variant pt-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <DetailItem label="Name" value={selectedUser.name} />
                    <DetailItem label="Email" value={selectedUser.email} />
                    <DetailItem label="Role" value={selectedUser.role} />
                    <DetailItem label="Department" value={selectedUser.department} />
                    <DetailItem label="Created by" value={getPersonName(selectedUser.createdBy, users, currentUser)} />
                    <DetailItem label="Created" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'} />
                    <DetailItem label="Updated" value={selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString() : 'Unknown'} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between px-8 py-6 border-t border-outline-variant">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Page {page} · Showing {visibleUsers.length} users
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || isLoading}
              onClick={() => {
                setSelectedUser(null);
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
              disabled={isLoading || users.length < USERS_PER_PAGE}
              onClick={() => {
                setSelectedUser(null);
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
  );
}

function FormField({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-container-low px-4 py-3">
      <span className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <span className="mt-1 block text-sm font-bold text-on-surface">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, className }) {
  return (
    <div className={cn("bg-surface border border-outline-variant p-4 rounded-2xl flex items-center gap-4 shadow-sm", className)}>
      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <span className="block text-[10px] font-black tracking-widest text-on-surface-variant uppercase">{label}</span>
        <span className="block text-lg font-black">{value}</span>
      </div>
    </div>
  );
}

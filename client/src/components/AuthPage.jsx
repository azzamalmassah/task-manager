import React, { useState } from 'react';
import { ArrowLeft, LayoutGrid, Loader2 } from 'lucide-react';
import { loginUser, signupUser } from '../lib/authApi';

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

export default function AuthPage({ mode = 'login', onBack, onSuccess, onSwitchMode }) {
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    department: 'Engineering',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = isSignup ? await signupUser(form) : await loginUser(form);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant bg-surface">
        <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Task Orchestrator</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-12 md:py-20">
        <section className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_420px] md:items-center">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">
              {isSignup ? 'Create workspace access' : 'Welcome back'}
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              {isSignup ? 'Start orchestrating work from one focused command center.' : 'Sign in to continue your workflow.'}
            </h1>
            <p className="max-w-xl text-lg font-medium text-on-surface-variant">
              Login and signup now connect directly to your Express backend routes. Your session token is saved locally for the next frontend integrations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-2xl font-black">{isSignup ? 'Create account' : 'Log in'}</h2>
              <p className="mt-1 text-sm font-medium text-on-surface-variant">
                {isSignup ? 'Use your team details below.' : 'Use your registered email and password.'}
              </p>
            </div>

            {isSignup && (
              <label className="block space-y-2 text-sm font-bold">
                <span>Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  minLength={8}
                  maxLength={20}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                  placeholder="Azzam Manager"
                />
              </label>
            )}

            <label className="block space-y-2 text-sm font-bold">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2 text-sm font-bold">
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                required
                minLength={8}
                maxLength={30}
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                placeholder="Minimum 8 characters"
              />
            </label>

            {isSignup && (
              <>
                <label className="block space-y-2 text-sm font-bold">
                  <span>Confirm password</span>
                  <input
                    name="passwordConfirm"
                    type="password"
                    value={form.passwordConfirm}
                    onChange={updateField}
                    required
                    minLength={8}
                    maxLength={30}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                    placeholder="Repeat password"
                  />
                </label>

                <label className="block space-y-2 text-sm font-bold">
                  <span>Department</span>
                  <select
                    name="department"
                    value={form.department}
                    onChange={updateField}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary"
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignup ? 'Create Account' : 'Log In'}
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode(isSignup ? 'login' : 'signup')}
              className="w-full text-center text-sm font-bold text-secondary hover:opacity-80"
            >
              {isSignup ? 'Already have an account? Log in' : 'Need an account? Sign up'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}


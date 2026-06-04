import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import MyTasks from './components/MyTasks';
import { LayoutGrid, BarChart3, ListTodo, Users as UsersIcon, Settings, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('task-orchestrator-token');
    const user = localStorage.getItem('task-orchestrator-user');
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  });

  const handleAuthSuccess = (result) => {
    const user = result.data?.user || null;
    localStorage.setItem('task-orchestrator-token', result.token);
    localStorage.setItem('task-orchestrator-user', JSON.stringify(user));
    setAuth({ token: result.token, user });
    setScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('task-orchestrator-token');
    localStorage.removeItem('task-orchestrator-user');
    setAuth({ token: null, user: null });
    setScreen('landing');
  };

  const canViewMyWork = auth.user?.role === 'user' || auth.user?.role === 'employee';

  if (screen === 'landing') {
    return (
      <LandingPage
        onLogin={() => setScreen('login')}
        onSignup={() => setScreen('signup')}
        onGetStarted={() => setScreen(auth.token ? 'dashboard' : 'signup')}
      />
    );
  }

  if (screen === 'login' || screen === 'signup') {
    return (
      <AuthPage
        mode={screen}
        onBack={() => setScreen('landing')}
        onSuccess={handleAuthSuccess}
        onSwitchMode={setScreen}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-surface border-b border-outline-variant h-16">
        <div className="flex justify-between items-center h-full px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setScreen('landing')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <LayoutGrid className="text-secondary w-6 h-6" />
              <h1 className="text-lg font-black tracking-tight">Task Orchestrator</h1>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-2">
              <NavButton active={screen === 'dashboard'} onClick={() => setScreen('dashboard')}>Overview</NavButton>
              {canViewMyWork && <NavButton active={screen === 'tasks'} onClick={() => setScreen('tasks')}>My Work</NavButton>}
            </nav>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-xs font-black text-secondary">
              {auth.user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[280px] h-[calc(100vh-64px)] fixed left-0 top-16 bg-surface-container-lowest border-r border-outline-variant py-8 px-4 z-30">
          <div className="mb-8 px-4">
            <h2 className="text-[10px] font-black tracking-widest text-secondary uppercase mb-4">Management</h2>
          </div>
          <nav className="space-y-1 flex-1">
            <SidebarItem 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Dashboard" 
              active={screen === 'dashboard'} 
              onClick={() => setScreen('dashboard')} 
            />
            {canViewMyWork && (
              <SidebarItem 
                icon={<ListTodo className="w-5 h-5" />} 
                label="Tasks" 
                active={screen === 'tasks'} 
                onClick={() => setScreen('tasks')} 
              />
            )}
            <SidebarItem 
              icon={<UsersIcon className="w-5 h-5" />} 
              label="Users" 
              active={screen === 'users'} 
              onClick={() => setScreen('users')} 
            />
            <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" />
          </nav>
          <div className="pt-8 border-t border-outline-variant">
            <SidebarItem 
              icon={<LogOut className="w-5 h-5" />} 
              label="Logout" 
              onClick={handleLogout} 
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 pt-16 md:pl-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {screen === 'dashboard' && <Dashboard token={auth.token} user={auth.user} />}
              {screen === 'users' && <UserManagement token={auth.token} currentUser={auth.user} />}
              {screen === 'tasks' && <MyTasks token={auth.token} user={auth.user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface border-t border-outline-variant shadow-2xl">
        <MobileNavButton active={screen === 'dashboard'} onClick={() => setScreen('dashboard')} icon={<BarChart3 className="w-5 h-5" />} label="Home" />
        {canViewMyWork && <MobileNavButton active={screen === 'tasks'} onClick={() => setScreen('tasks')} icon={<ListTodo className="w-5 h-5" />} label="Tasks" />}
        <MobileNavButton active={screen === 'users'} onClick={() => setScreen('users')} icon={<UsersIcon className="w-5 h-5" />} label="Users" />
        <MobileNavButton active={false} onClick={() => {}} icon={<User className="w-5 h-5" />} label="Profile" />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200",
        active 
          ? "bg-secondary-container text-white shadow-md shadow-blue-100" 
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function NavButton({ children, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
        active ? "text-secondary" : "text-on-surface-variant hover:bg-surface-container-low"
      )}
    >
      {children}
    </button>
  );
}

function MobileNavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-secondary" : "text-on-surface-variant"
      )}
    >
      <div className={cn("p-1.5 rounded-xl transition-all", active ? "bg-secondary-container text-white shadow-sm" : "")}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

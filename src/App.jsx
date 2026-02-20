import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import LevelBar from './components/LevelBar';
import AuthForm from './components/AuthForm';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import HelpModal from './components/HelpModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import { triggerNeonConfetti } from './utils/confetti';
import { useTheme } from './utils/ThemeContext';
import { apiFetch, setCsrfToken } from './utils/api';
import logo from './assets/logo.png';

function App() {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalTasks: 0 });
  const [user, setUser] = useState(null); // Auth State
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);
  const [categories, setCategories] = useState([]); // [NEW] Synchronized categories state
  const [isLevelUp, setIsLevelUp] = useState(false); // New Level Up State
  const [activeCalendarTaskId, setActiveCalendarTaskId] = useState(null); // [NEW] Mutual exclusion for calendars
  const { theme, setThemeState } = useTheme();

  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    overdue: false
  });

  const refreshCategories = () => setCategoryRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch tasks and categories whenever filters or trigger change
  useEffect(() => {
    if (user) {
      fetchTasks(1);
      fetchCategories();
    }
  }, [filters, user, categoryRefreshTrigger]);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('api/categories.php');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await apiFetch('api/auth.php'); // Default action checks session
      const data = await res.json();
      if (data.isAuthenticated) {
        if (data.csrf_token) {
          setCsrfToken(data.csrf_token);
        }
        setUser(data.user);
        if (data.user.theme) {
          setThemeState(data.user.theme);
        }
        // fetchTasks(1) called by useEffect above when user is set
      }
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      // Build Query String
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...filters
      });

      const res = await apiFetch(`api/tasks.php?${params.toString()}`);
      if (res.status === 401) {
        setUser(null);
        return;
      }
      const responseData = await res.json();

      if (responseData.data) {
        setTasks(responseData.data);
        setPagination({
          currentPage: responseData.meta.current_page,
          totalPages: responseData.meta.total_pages,
          totalTasks: responseData.meta.total_tasks
        });
      } else if (Array.isArray(responseData)) {
        setTasks(responseData);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await apiFetch('api/user.php');
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, ...data }));

        // Detect Level Up from Backend Flag
        if (data.leveled_up) {
          triggerNeonConfetti(theme); // Trigger Confetti - user.theme or current state
          setIsLevelUp(true);    // Trigger Border Animation
          setTimeout(() => setIsLevelUp(false), 5000); // Reset after 5s
        }
      }
    } catch (err) { }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.theme) {
      setThemeState(userData.theme);
    }
    fetchTasks(1);
  };

  const handleLogout = async () => {
    await apiFetch('api/auth.php?action=logout', { method: 'POST' });
    setCsrfToken(null);
    setUser(null);
    setTasks([]);
    setShowProfile(false);
    setShowAdmin(false);
    setShowHelp(false);
  };

  const handleAddTask = async (newTask) => {
    try {
      const res = await apiFetch('api/tasks.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        triggerNeonConfetti(theme);
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status == 1 ? 0 : 1;

      // Optimistic Update for UI responsiveness
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      ));

      const res = await apiFetch('api/tasks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });

      if (res.ok) {
        // Delayed fetch to allow animation before sorting kicks in
        setTimeout(() => {
          fetchTasks(pagination.currentPage);
        }, 2000);

        // If completing, refresh user stats to check for level up
        if (newStatus === 1) {
          triggerNeonConfetti(theme);
          await fetchUserStats();
        }
      } else {
        // Revert on failure
        fetchTasks(pagination.currentPage);
      }
    } catch (err) {
      console.error("Error updating task", err);
      fetchTasks(pagination.currentPage); // Revert
    }
  };

  const handleUpdateTask = async (task, updates) => {
    try {
      // Allow legacy call with just string title or new object
      const body = typeof updates === 'string'
        ? { id: task.id, title: updates }
        : { id: task.id, ...updates };

      const res = await apiFetch('api/tasks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchTasks(pagination.currentPage);
      } else {
        const text = await res.text();
        console.error(`Update failed: ${res.status} ${res.statusText}`, text);
      }
    } catch (err) {
      console.error("Update failed with exception:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`api/tasks.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-cyber-black text-cyber-primary flex items-center justify-center font-mono">INITIALIZING SYSTEM...</div>;
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white p-4 md:p-8 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] cyber-grid"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-8 flex flex-col lg:flex-row justify-between items-start gap-4 border-b border-cyber-gray pb-4">
          <div className="w-full lg:w-auto">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <a href="./" className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline text-inherit">
                <img src={logo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_0_8px_var(--theme-primary)]" />
                <span className={theme === 'lcars' ? "text-cyber-primary font-['Antonio',_sans-serif] font-normal tracking-[0.1em] drop-shadow-none" : "bg-clip-text text-transparent bg-gradient-to-r from-cyber-primary to-cyber-secondary drop-shadow-[0_0_5px_var(--theme-primary)]"}>
                  {t('header.title')}<span className="text-white">{t('header.subtitle')}</span>
                </span>
              </a>
            </h1>
            <div className="text-[10px] md:text-xs text-gray-300 font-bold tracking-widest mt-1 opacity-80 uppercase">
              {t('header.operative')}: <span className="text-cyber-success">{user ? user.username : t('header.unknown')}</span>
              {user?.role === 'admin' && <span className="ml-2 text-cyber-secondary border border-cyber-secondary/30 px-1 rounded">{t('header.admin_clearance')}</span>}
            </div>
          </div>

          <div className={`flex w-full lg:w-auto justify-start lg:justify-end ${theme === 'lcars' ? 'flex-col items-end gap-1' : 'flex-wrap lg:flex-nowrap items-center gap-2'}`}>
            {theme !== 'lcars' && <LanguageSwitcher />}

            {user && (
              <div className="flex flex-wrap lg:flex-nowrap gap-2">
                <button onClick={() => setShowHelp(true)} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-2 py-1 rounded'}`}>
                  {t('header.system_help')}
                </button>
                <button onClick={() => setShowProfile(true)} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded'}`}>
                  {t('header.profile')}
                </button>
                {user.role === 'admin' && (
                  <button onClick={() => setShowAdmin(true)} className={`text-[10px] md:text-xs transition-colors font-bold whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-warning/50 text-yellow-500 hover:bg-yellow-500 hover:text-black px-2 py-1 rounded'}`}>
                    {t('header.admin')}
                  </button>
                )}
                <button onClick={handleLogout} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-[#ffaa00] text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-danger/50 text-cyber-danger hover:bg-cyber-danger hover:text-white px-2 py-1 rounded btn-cyber-danger'}`}>
                  {t('header.logout')}
                </button>
              </div>
            )}

            {theme === 'lcars' && <LanguageSwitcher />}
          </div>
        </header>

        {!user ? (
          <AuthForm onLogin={handleLogin} />
        ) : (
          <>
            <LevelBar
              level={user.current_level || user.stats?.current_level || 1}
              currentXP={user.total_points || user.stats?.total_points || 0}
              totalXPForLevel={100}
              isLevelUp={isLevelUp} // [NEW]
            />

            <div className="relative z-30">
              <TaskForm
                onAddTask={handleAddTask}
                categoryRefreshTrigger={categoryRefreshTrigger}
                categories={categories} // [NEW] Pass categories
              />
            </div>

            <TaskFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories} // [NEW] Pass dynamic categories
            />

            <div className="space-y-4">
              <h2 className="text-xl text-cyber-success border-l-4 border-cyber-success pl-3 mb-4 uppercase tracking-wider">
                {t('tasks.active_directives')}
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800 rounded-lg">
                  {t('tasks.no_directives')}
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onUpdateTask={handleUpdateTask}
                      onDelete={handleDelete}
                      activeCalendarTaskId={activeCalendarTaskId}
                      setActiveCalendarTaskId={setActiveCalendarTaskId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-12">
                <button
                  onClick={() => fetchTasks(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  «
                </button>
                <button
                  onClick={() => fetchTasks(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  ‹
                </button>

                <span className="text-gray-500 font-mono text-sm px-2">
                  {t('tasks.page')} <span className="text-white">{pagination.currentPage}</span> / {pagination.totalPages}
                </span>

                <button
                  onClick={() => fetchTasks(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  ›
                </button>
                <button
                  onClick={() => fetchTasks(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
          onUserUpdate={() => {
            fetchTasks(pagination.currentPage);
            checkAuth();
          }}
          onCategoryUpdate={refreshCategories} // [NEW]
        />
      )}

      {showAdmin && user?.role === 'admin' && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TaskCard from './components/TaskCard';
import FocusHeroCard from './components/FocusHeroCard';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import LevelBar from './components/LevelBar';
import AuthForm from './components/AuthForm';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import HelpModal from './components/HelpModal';
import LanguageSwitcher from './components/LanguageSwitcher';
import CalendarModal from './components/CalendarModal';
import KanbanBoard from './components/KanbanBoard';
import DirectiveModal from './components/DirectiveModal';
import CyberConfirm from './components/CyberConfirm';
import BatchActionBar from './components/BatchActionBar';
import { apiFetch } from './utils/api';
import { useTheme } from './utils/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import logo from './assets/logo.png';

function App() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const {
    user,
    loading,
    isLevelUp,
    checkAuth,
    handleLogin,
    handleLogout,
    fetchUserStats
  } = useAuth();

  const {
    tasks,
    pagination,
    filters,
    setFilters,
    categories,
    categoryRefreshTrigger,
    refreshCategories,
    fetchCategories,
    taskStatuses,
    statusRefreshTrigger,
    refreshTaskStatuses,
    fetchTaskStatuses,
    fetchTasks,
    fetchAllOpenTasks,
    fetchKanbanTasks,
    handleAddTask,
    handleToggleStatus,
    handleUpdateTask,
    handleDelete
  } = useTasks(user, fetchUserStats, handleLogout);

  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDossierForTask, setShowDossierForTask] = useState(null);
  const [activeCalendarTaskId, setActiveCalendarTaskId] = useState(null);
  const [taskPrefill, setTaskPrefill] = useState(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isKanbanMode, setIsKanbanMode] = useState(false);
  const [kanbanTasksQueue, setKanbanTasksQueue] = useState([]);
  const [focusTasksQueue, setFocusTasksQueue] = useState([]);
  const [dossierContext, setDossierContext] = useState(null);
  const [focusSkipIndex, setFocusSkipIndex] = useState(0);
  const [focusAnimatingNext, setFocusAnimatingNext] = useState(false);
  const [focusCompleting, setFocusCompleting] = useState(false);

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) return;
    try {
      const res = await apiFetch('api/index.php?route=tasks/bulk_update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: selectedTasks, status: 1, workflow_status: 'completed' })
      });
      if (res.ok) {
        import('./utils/confetti').then(({ triggerNeonConfetti }) => triggerNeonConfetti(theme));
        setSelectedTasks([]);
        fetchTasks(pagination.currentPage);
        if (fetchUserStats) fetchUserStats();
      }
    } catch (err) {
      console.error("Bulk complete error", err);
    }
  };

  const confirmBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    if (selectedTasks.length === 0) return;
    try {
      const res = await apiFetch('api/index.php?route=tasks/bulk_delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: selectedTasks })
      });
      if (res.ok) {
        setSelectedTasks([]);
        fetchTasks(1);
      }
    } catch (err) {
      console.error("Bulk delete error", err);
    }
  };

  const loadFocusQueue = async () => {
    try {
      // We intentionally re-sort for Focus mode to guarantee absolute determinism
      const allOpenTasks = await fetchAllOpenTasks();

      if (!allOpenTasks || !Array.isArray(allOpenTasks)) {
        console.warn("loadFocusQueue: allOpenTasks is not a valid array:", allOpenTasks);
        setFocusTasksQueue([]);
        setFocusSkipIndex(0);
        return;
      }

      const sortedTasks = [...allOpenTasks];
      sortedTasks.sort((a, b) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const aIsOverdue = a.due_date && new Date(a.due_date) < today;
        const bIsOverdue = b.due_date && new Date(b.due_date) < today;

        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;

        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        if (a.due_date && b.due_date) {
          const dateDiff = new Date(a.due_date) - new Date(b.due_date);
          if (dateDiff !== 0) return dateDiff;
        }

        return a.id - b.id;
      });

      setFocusTasksQueue(sortedTasks);
      setFocusSkipIndex(0);
    } catch (e) {
      console.error("Failed to load focus queue", e);
      setFocusTasksQueue([]);
      setFocusSkipIndex(0);
    }
  };

  const getFocusTask = () => {
    if (!focusTasksQueue || focusTasksQueue.length === 0) {
      return null;
    }

    if (focusSkipIndex >= focusTasksQueue.length) {
      // Return the first element securely if skip index gets out of bounds
      // The actual state reset should happen safely via effects or handlers if needed, not during render
      return focusTasksQueue[0];
    }

    return focusTasksQueue[focusSkipIndex];
  };

  const loadKanbanQueue = async () => {
    try {
      const allKanbanTasks = await fetchKanbanTasks();
      if (!allKanbanTasks || !Array.isArray(allKanbanTasks)) {
        setKanbanTasksQueue([]);
        return;
      }
      setKanbanTasksQueue(allKanbanTasks);
    } catch (e) {
      console.error("Failed to load kanban queue", e);
      setKanbanTasksQueue([]);
    }
  };

  const focusTask = getFocusTask();

  const handleFocusSkip = () => {
    setFocusAnimatingNext(true);
    setTimeout(() => {
      setFocusSkipIndex(prev => prev + 1);
      setFocusAnimatingNext(false);
    }, 300); // match animation duration
  };

  const handleFocusComplete = async () => {
    if (!focusTask || focusCompleting) return;

    setFocusCompleting(true);
    try {
      await handleToggleStatus(focusTask);
      // Remove it locally from the focus queue so it doesn't reappear
      setFocusTasksQueue(prev => prev.filter(t => t.id !== focusTask.id));

      // Wait for the complete animation before rendering the next suitable task
      setTimeout(() => {
        setFocusCompleting(false);
      }, 500);
    } catch (err) {
      console.error("Focus mode complete error", err);
      setFocusCompleting(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchTasks(1);
      fetchCategories();
      fetchTaskStatuses();
    }
  }, [user, filters, categoryRefreshTrigger, statusRefreshTrigger, fetchTasks, fetchCategories, fetchTaskStatuses]);

  // Global Keyboard Shortcuts (N and /)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const el = document.getElementById('new-directive-input');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.focus(), 300); // Wait for scroll
        }
      } else if (e.key === '/') {
        e.preventDefault();
        const el = document.getElementById('global-search-input');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => el.focus(), 300); // Wait for scroll
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleFullLogout = () => {
    handleLogout();
    setShowProfile(false);
    setShowAdmin(false);
    setShowHelp(false);
  };

  const hasCompletedTasks = pagination.hasCompletedTasks;

  const confirmPurgeCompleted = async () => {
    setShowPurgeConfirm(false);
    try {
      const response = await apiFetch('api/index.php?route=tasks/bulk_delete_completed', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to purge completed tasks');

      // Refresh tasks and stats
      fetchTasks(pagination.currentPage);
      if (fetchUserStats) {
        fetchUserStats();
      }
    } catch (err) {
      console.error('Purge error:', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-cyber-black text-cyber-primary flex items-center justify-center font-mono">INITIALIZING SYSTEM...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] cyber-grid"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <header className={`mb-8 flex flex-col lg:flex-row lg:flex-wrap justify-between items-start lg:items-center gap-4 border-b border-cyber-gray pb-4 ${(isFocusMode || isKanbanMode) ? 'relative z-50 transition-all duration-500' : ''}`}>
          <div className="w-full lg:w-auto">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <a href="./" className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline text-inherit">
                <img src={logo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 drop-shadow-[0_0_8px_var(--theme-primary)]" />
                {/* Theme-specific logo styling */}
                {theme === 'lcars' && (
                  <span className="text-cyber-primary font-['Antonio',_sans-serif] font-normal tracking-[0.1em] drop-shadow-none">
                    {t('header.title')}<span className="text-white">{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'robco' && (
                  <span className="font-mono tracking-[0.15em] text-green-400" style={{ textShadow: '0 0 8px #1aff1a, 0 0 16px rgba(26,255,26,0.4)' }}>
                    {t('header.title')}<span className="text-green-600">{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'grid' && (
                  <span className="font-sans font-bold tracking-[0.12em]" style={{ background: 'linear-gradient(90deg, #6fc3df, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(111,195,223,0.7))' }}>
                    {t('header.title')}<span style={{ WebkitTextFillColor: 'rgba(111,195,223,0.5)' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'section9' && (
                  <span className="font-sans font-bold tracking-[0.08em]" style={{ color: '#34e2e2', textShadow: '0 0 8px #34e2e2, 3px 0 10px rgba(255,0,255,0.35), -3px 0 10px rgba(0,255,255,0.35)' }}>
                    {t('header.title')}<span style={{ color: '#eeeeec', textShadow: 'none' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'outrun' && (
                  <span className="font-sans font-black italic tracking-[0.1em]" style={{ background: 'linear-gradient(90deg, #ff00ff 0%, #ff6600 50%, #00ffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 8px rgba(255,0,255,0.6))' }}>
                    {t('header.title')}<span style={{ background: 'linear-gradient(90deg, #ff6600, #00ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'steampunk' && (
                  <span style={{ fontFamily: "'IM Fell English', 'Cinzel', Georgia, serif", color: '#c8882a', textShadow: '0 0 10px rgba(200,136,42,0.5), 1px 1px 0px #3d2010', letterSpacing: '0.08em' }}>
                    {t('header.title')}<span style={{ color: '#d4af37' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'force' && (
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", color: '#cc4422', textShadow: '0 0 8px rgba(204,68,34,0.6), 2px 0 10px rgba(52,226,226,0.3)', letterSpacing: '0.15em', fontWeight: 'bold' }}>
                    {t('header.title')}<span style={{ color: '#34e2e2' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'arrakis' && (
                  <span style={{ fontFamily: "'Cinzel', serif", color: '#d97706', textShadow: '0 0 15px rgba(217,119,6,0.5), 0 0 30px rgba(217,119,6,0.2)', letterSpacing: '0.12em', fontWeight: 'bold' }}>
                    {t('header.title')}<span style={{ color: '#fbbf24' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'renaissance' && (
                  <span style={{ fontFamily: "'Michroma', sans-serif", color: '#ffb000', textShadow: '2px 2px 0px #1a1a1a, 0 0 10px rgba(255,176,0,0.4)', letterSpacing: '0.1em', fontSize: '0.9em' }}>
                    {t('header.title')}<span style={{ color: '#d4af37' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {theme === 'klingon' && (
                  <span style={{ fontFamily: "'Wallpoet', cursive", color: '#ff0000', filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.8))', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {t('header.title')}<span style={{ color: '#a0a0b0', textShadow: '2px 2px 0px #4a0000' }}>{t('header.subtitle')}</span>
                  </span>
                )}
                {!['lcars', 'robco', 'grid', 'section9', 'outrun', 'steampunk', 'force', 'arrakis', 'renaissance', 'klingon'].includes(theme) && (
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isFocusMode ? 'from-white to-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'from-cyber-primary to-cyber-secondary drop-shadow-[0_0_5px_var(--theme-primary)]'}`}>
                    {t('header.title')}<span className="text-white">{t('header.subtitle')}</span>
                  </span>
                )}
              </a>
            </h1>
            <div className="text-[10px] md:text-xs text-gray-300 font-bold tracking-widest mt-1 opacity-80 uppercase">
              {t('header.operative')}: <span className="text-cyber-success">{user ? user.username : t('header.unknown')}</span>
              {user?.role === 'admin' && <span className="ml-2 text-cyber-secondary border border-cyber-secondary/30 px-1 rounded">{t('header.admin_clearance')}</span>}
            </div>
            {user && (
              <div className="mt-2 text-[10px] md:text-xs text-cyber-primary italic opacity-90 border-l-2 border-cyber-primary pl-2 font-mono">
                "{t(`quotes.${(() => {
                  const today = new Date();
                  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
                  return seed % 10;
                })()}`)}"
              </div>
            )}
          </div>

          <div className={`flex w-full lg:w-auto lg:ml-auto lg:flex-shrink-0 justify-start lg:justify-end ${theme === 'lcars' ? 'flex-col items-start lg:items-end gap-1' : 'flex-wrap items-center gap-2'}`}>
            {theme !== 'lcars' && !isFocusMode && !isKanbanMode && <LanguageSwitcher />}

            {user && (
              <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center">
                {!isFocusMode && !isKanbanMode && (
                  <>
                    <button onClick={() => setShowHelp(true)} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-2 py-1 rounded'}`} data-tooltip-content={t('header.system_help')}>
                      {t('header.system_help')}
                    </button>
                    <button data-testid="kanban-btn" onClick={() => {
                      setIsKanbanMode(true);
                      loadKanbanQueue();
                    }} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded'}`} data-tooltip-content={t('header.kanban_enter', 'Enter Kanban Mode')}>
                      KANBAN
                    </button>
                    <button data-testid="calendar-btn" onClick={() => setShowCalendar(true)} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded'}`} data-tooltip-content={t('tooltip.calendar', 'Calendar')}>
                      {t('header.calendar')}
                    </button>
                    <button data-testid="profile-btn" onClick={() => setShowProfile(true)} className={`text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded'}`} data-tooltip-content={t('tooltip.settings', 'Settings')}>
                      {t('header.profile')}
                    </button>
                  </>
                )}

                {isKanbanMode && (
                  <button
                    data-testid="kanban-exit-btn"
                    onClick={() => {
                      setIsKanbanMode(false);
                      fetchTasks(pagination.currentPage); // refresh normal dashboard just in case
                    }}
                    className={`text-[10px] md:text-xs transition-colors font-bold whitespace-nowrap ${theme === 'lcars' ? 'bg-white text-black uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'bg-cyber-primary text-black px-4 py-1.5 rounded shadow-[0_0_15px_var(--theme-primary)] hover:bg-opacity-80 uppercase tracking-widest'}`}
                  >
                    EXIT KANBAN
                  </button>
                )}

                {!isKanbanMode && (
                  <button
                    data-testid="focus-btn"
                    onClick={() => {
                      const newMode = !isFocusMode;
                      setIsFocusMode(newMode);
                      if (newMode) {
                        loadFocusQueue();
                      }
                    }}
                    className={`text-[10px] md:text-xs transition-colors font-bold whitespace-nowrap ${isFocusMode
                      ? (theme === 'lcars' ? 'bg-white text-black uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'bg-cyber-primary text-black px-4 py-1.5 rounded shadow-[0_0_15px_var(--theme-primary)] hover:bg-opacity-80 uppercase tracking-widest')
                      : (theme === 'lcars' ? 'border-2 border-cyber-primary text-cyber-primary uppercase rounded-full px-4 py-1.5 hover:bg-cyber-primary hover:text-black' : 'border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded shadow-[0_0_5px_var(--theme-primary)] hover:shadow-[0_0_15px_var(--theme-primary)]')
                      }`}
                    data-tooltip-content={isFocusMode ? t('header.focus_exit_tooltip', 'Exit Focus Mode') : t('header.focus_enter_tooltip', 'Enter Focus Mode')}
                  >
                    {isFocusMode ? t('header.focus_exit', 'EXIT FOCUS') : t('header.focus_enter', 'FOCUS')}
                  </button>
                )}

                {!isFocusMode && !isKanbanMode && user.role === 'admin' && (
                  <button data-testid="admin-btn" onClick={() => setShowAdmin(true)} className={`text-[10px] md:text-xs transition-colors font-bold whitespace-nowrap ${theme === 'lcars' ? 'bg-cyber-primary text-black uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black px-2 py-1 rounded'}`} data-tooltip-content={t('header.admin')}>
                    {t('header.admin')}
                  </button>
                )}
                {!isFocusMode && !isKanbanMode && (
                  <button data-testid="logout-btn" onClick={handleFullLogout} className={`absolute top-0 right-0 lg:static text-[10px] md:text-xs transition-colors whitespace-nowrap ${theme === 'lcars' ? 'bg-[#ffaa00] text-black font-bold uppercase rounded-full px-4 py-1.5 hover:brightness-110' : 'border border-cyber-danger/50 text-cyber-danger hover:bg-cyber-danger hover:text-white px-2 py-1 rounded'}`} data-tooltip-content={t('tooltip.logout', 'Logout')} data-tooltip-pos="bottom">
                    {t('header.logout')}
                  </button>
                )}
              </div>
            )}

            {theme === 'lcars' && !isFocusMode && !isKanbanMode && <LanguageSwitcher />}
          </div>
        </header>

        {!user ? (
          <AuthForm onLogin={handleLogin} />
        ) : isFocusMode ? (
          <>
            {/* Overlay to focus the user (uses the native theme background heavily obscured, matching light/dark correctly) */}
            <div className="fixed inset-0 bg-cyber-black/95 z-40 pointer-events-none"></div>

            <div className="flex items-center justify-center min-h-[70vh] relative z-50 w-full text-left">
              <div className="w-full">
                <FocusHeroCard
                  task={focusTask}
                  categories={categories}
                  taskStatuses={taskStatuses}
                  onToggleStatus={handleFocusComplete}
                  onUpdateTask={handleUpdateTask}
                  onSkip={handleFocusSkip}
                  onOpenDossier={setShowDossierForTask}
                  isSkipping={focusAnimatingNext}
                  isCompleting={focusCompleting}
                />
              </div>
            </div>
          </>
        ) : isKanbanMode ? (
          <KanbanBoard
            tasks={kanbanTasksQueue}
            taskStatuses={taskStatuses}
            onUpdateTask={handleUpdateTask}
            onToggleStatus={handleToggleStatus}
            onDelete={async (taskId) => {
              await handleDelete(taskId);
              const t = kanbanTasksQueue.find(t => t.id === taskId);
              if (t && t.status == 1 && fetchUserStats) fetchUserStats();
              setKanbanTasksQueue(prev => prev.filter(t => t.id !== taskId));
            }}
            onTaskClick={(task) => {
              setDossierContext('kanban');
              setShowDossierForTask(task);
            }}
          />
        ) : (
          <>
            <LevelBar
              level={user.current_level || user.stats?.current_level || 1}
              currentXP={user.total_points || user.stats?.total_points || 0}
              totalXPForLevel={100}
              isLevelUp={isLevelUp}
            />

            <div className="relative z-30">
              <TaskForm
                onAddTask={handleAddTask}
                categoryRefreshTrigger={categoryRefreshTrigger}
                categories={categories}
                prefillData={taskPrefill}
              />
            </div>

            <TaskFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              hasCompletedTasks={hasCompletedTasks}
              onPurgeCompleted={() => setShowPurgeConfirm(true)}
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
                      user={user}
                      categories={categories}
                      taskStatuses={taskStatuses}
                      onToggleStatus={handleToggleStatus}
                      onUpdateTask={handleUpdateTask}
                      onDelete={handleDelete}
                      activeCalendarTaskId={activeCalendarTaskId}
                      setActiveCalendarTaskId={setActiveCalendarTaskId}
                      isSelected={selectedTasks.includes(task.id)}
                      onSelect={handleSelectTask}
                      onDuplicate={(taskToDuplicate) => {
                        setTaskPrefill({ ...taskToDuplicate, timestamp: Date.now() });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-12">
                <button
                  data-testid="first-page"
                  onClick={() => fetchTasks(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  «
                </button>
                <button
                  data-testid="previous-page"
                  onClick={() => fetchTasks(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  ‹
                </button>

                <span className="text-gray-500 font-mono text-sm px-2 pr-4">
                  {t('tasks.page')} <span className="text-white">{pagination.currentPage}</span> / {pagination.totalPages}
                </span>

                <button
                  data-testid="next-page"
                  onClick={() => fetchTasks(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-cyber-gray text-cyber-primary disabled:opacity-30 hover:bg-white/10"
                >
                  ›
                </button>
                <button
                  data-testid="last-page"
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
          onLogout={handleFullLogout}
          onUserUpdate={() => {
            fetchTasks(pagination.currentPage);
            checkAuth(true);
          }}
          onCategoryUpdate={refreshCategories}
          taskStatuses={taskStatuses}
          onStatusUpdate={refreshTaskStatuses}
        />
      )}

      {showAdmin && user?.role === 'admin' && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {showCalendar && (
        <CalendarModal
          tasks={tasks}
          onClose={() => setShowCalendar(false)}
          onOpenDossier={(task) => {
            setShowCalendar(false); // hide calendar temporarily
            setDossierContext('calendar');
            setShowDossierForTask(task);
          }}
        />
      )}

      {showDossierForTask && (
        <DirectiveModal
          task={showDossierForTask}
          user={user}
          categories={categories}
          onUpdate={async (task, updates) => {
            // Update the single task state in App context here
            const success = await handleUpdateTask(task, updates);
            // Dossier component re-renders from App state
            if (success) {
              setShowDossierForTask(prev => ({ ...prev, ...updates }));
            }
            return success;
          }}
          onDuplicate={(task) => {
            setTaskPrefill({ ...task, timestamp: Date.now() });
            setShowDossierForTask(null); // Keep calendar closed since we jump to creation
            setDossierContext(null);
          }}
          onClose={() => {
            setShowDossierForTask(null);
            if (dossierContext === 'calendar') {
              setShowCalendar(true); // Bring back calendar!
            }
            if (dossierContext === 'kanban') {
              // Reload kanban queue to reflect deeply nested sub-routine updates or status changes made purely in dossier
              loadKanbanQueue();
            }
            setDossierContext(null);
          }}
        />
      )}

      {showPurgeConfirm && (
        <CyberConfirm
          message={t('tasks.purge_confirm', 'WARNING: This will permanently delete ALL completed directives. Proceed?')}
          onConfirm={confirmPurgeCompleted}
          onCancel={() => setShowPurgeConfirm(false)}
          neonColor="red"
        />
      )}

      {showBulkDeleteConfirm && (
        <CyberConfirm
          message={t('tasks.batch_actions.delete_confirm', 'WARNING: THIS WILL PERMANENTLY DELETE ALL SELECTED DIRECTIVES. PROCEED?')}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
          neonColor="red"
        />
      )}

      {selectedTasks.length > 0 && !isFocusMode && (
        <BatchActionBar
          selectedCount={selectedTasks.length}
          onCompleteAll={handleBulkComplete}
          onDeleteAll={() => setShowBulkDeleteConfirm(true)}
          onClearSelection={handleClearSelection}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import LevelBar from './components/LevelBar';
import AuthForm from './components/AuthForm';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import HelpModal from './components/HelpModal';
import { triggerNeonConfetti } from './utils/confetti';

function App() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalTasks: 0 });
  const [user, setUser] = useState(null); // Auth State
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);

  const refreshCategories = () => setCategoryRefreshTrigger(prev => prev + 1);

  // ... (existing useEffect and fetch functions) ...

  // Check login status on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('api/auth.php'); // Default action checks session
      const data = await res.json();
      if (data.isAuthenticated) {
        setUser(data.user);
        fetchTasks(1); // [NEW] Fetch page 1
      }
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      const res = await fetch(`api/tasks.php?page=${page}&limit=50`); // [NEW]
      if (res.status === 401) {
        setUser(null);
        return;
      }
      const responseData = await res.json();

      // Handle both old (array) and new (object) formats temporarily or just switch
      // Since we updated backend, we expect object.
      if (responseData.data) {
        setTasks(responseData.data);
        setPagination({
          currentPage: responseData.meta.current_page,
          totalPages: responseData.meta.total_pages,
          totalTasks: responseData.meta.total_tasks
        });
      } else if (Array.isArray(responseData)) {
        // Fallback if backend revert?
        setTasks(responseData);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch('api/user.php');
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, ...data })); // Merge stats
      }
    } catch (err) { }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    fetchTasks(1);
  };

  const handleLogout = async () => {
    await fetch('api/auth.php?action=logout', { method: 'POST' });
    setUser(null);
    setTasks([]);
    setShowProfile(false);
    setShowAdmin(false);
    setShowHelp(false);
  };

  const handleAddTask = async (newTask) => {
    try {
      const res = await fetch('api/tasks.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status == 1 ? 0 : 1;
      const res = await fetch('api/tasks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });

      if (res.ok) {
        await fetchTasks(pagination.currentPage); // Stay on current page
        // If completing, refresh user stats to check for level up
        if (newStatus === 1) {
          triggerNeonConfetti();
          await fetchUserStats();
        }
      }
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  const handleUpdateTask = async (task, updates) => {
    try {
      // Allow legacy call with just string title or new object
      const body = typeof updates === 'string'
        ? { id: task.id, title: updates }
        : { id: task.id, ...updates };

      const res = await fetch('api/tasks.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchTasks(pagination.currentPage);
      }
    } catch (err) {
      console.error("Error updating task", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this directive?')) return;
    try {
      const res = await fetch(`api/tasks.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-cyber-black text-cyber-neonCyan flex items-center justify-center font-mono">INITIALIZING SYSTEM...</div>;
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white p-4 md:p-8 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-cyber-gray pb-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-neonCyan to-cyber-neonPink drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
              CYBER<span className="text-white">TASKER</span>
            </h1>
            <p className="text-xs text-gray-500 tracking-[0.3em] mt-1">
              OPERATIVE: <span className="text-cyber-neonGreen">{user ? user.username : 'UNKNOWN'}</span>
              {user?.role === 'admin' && <span className="block md:inline md:ml-2 text-yellow-500 font-bold mt-1 md:mt-0">[ADMIN CLEARANCE]</span>}
            </p>
          </div>
          {user && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setShowHelp(true)} className="text-xs border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 md:px-2 md:py-1 rounded transition-colors">
                SYSTEM HELP
              </button>
              {user.role === 'admin' && (
                <button onClick={() => setShowAdmin(true)} className="text-xs border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-3 py-2 md:px-2 md:py-1 rounded transition-colors font-bold">
                  ADMIN
                </button>
              )}
              <button onClick={() => setShowProfile(true)} className="text-xs border border-cyber-neonCyan text-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black px-3 py-2 md:px-2 md:py-1 rounded transition-colors">
                PROFILE
              </button>
              <button onClick={handleLogout} className="text-xs border border-red-900 text-red-700 hover:bg-red-900 hover:text-white px-3 py-2 md:px-2 md:py-1 rounded transition-colors">
                LOGOUT
              </button>
            </div>
          )}
        </header>

        {!user ? (
          <AuthForm onLogin={handleLogin} />
        ) : (
          <>
            <LevelBar
              level={user.current_level || user.stats?.current_level || 1}
              currentXP={user.total_points || user.stats?.total_points || 0}
              totalXPForLevel={100}
            />

            <div className="relative z-20">
              <TaskForm onAddTask={handleAddTask} categoryRefreshTrigger={categoryRefreshTrigger} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl text-cyber-neonGreen border-l-4 border-cyber-neonGreen pl-3 mb-4 uppercase tracking-wider">
                Active Directives
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-600 border border-dashed border-gray-800 rounded-lg">
                  NO ACTIVE DIRECTIVES
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
                  className="px-3 py-1 border border-cyber-gray text-cyber-neonCyan disabled:opacity-30 hover:bg-white/10"
                >
                  «
                </button>
                <button
                  onClick={() => fetchTasks(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-cyber-gray text-cyber-neonCyan disabled:opacity-30 hover:bg-white/10"
                >
                  ‹
                </button>

                <span className="text-gray-500 font-mono text-sm px-2">
                  PAGE <span className="text-white">{pagination.currentPage}</span> / {pagination.totalPages}
                </span>

                <button
                  onClick={() => fetchTasks(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-cyber-gray text-cyber-neonCyan disabled:opacity-30 hover:bg-white/10"
                >
                  ›
                </button>
                <button
                  onClick={() => fetchTasks(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-cyber-gray text-cyber-neonCyan disabled:opacity-30 hover:bg-white/10"
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
          onUserUpdate={() => fetchTasks(pagination.currentPage)}
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

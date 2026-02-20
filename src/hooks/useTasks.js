import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { triggerNeonConfetti } from '../utils/confetti';
import { useTheme } from '../utils/ThemeContext';

export function useTasks(user, fetchUserStats, onUnauthorized) {
    const [tasks, setTasks] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalTasks: 0 });
    const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);
    const [categories, setCategories] = useState([]);
    const { theme } = useTheme();

    const [filters, setFilters] = useState({
        search: '',
        priority: '',
        category: '',
        overdue: false
    });

    const refreshCategories = useCallback(() => setCategoryRefreshTrigger(prev => prev + 1), []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await apiFetch('api/index.php?route=categories');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    }, []);

    const fetchTasks = useCallback(async (page = 1) => {
        if (!user) return;
        try {
            const params = new URLSearchParams({
                page,
                limit: 50,
                ...filters
            });

            const res = await apiFetch(`api/index.php?route=tasks&${params.toString()}`);
            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
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
    }, [user, filters, onUnauthorized]);

    const handleAddTask = useCallback(async (newTask) => {
        try {
            const res = await apiFetch('api/index.php?route=tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (res.ok) {
                triggerNeonConfetti(theme);
                fetchTasks(1);
            }
        } catch (err) {
            console.error("Error adding task", err);
        }
    }, [theme, fetchTasks]);

    const handleToggleStatus = useCallback(async (task) => {
        try {
            const newStatus = task.status == 1 ? 0 : 1;

            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, status: newStatus } : t
            ));

            const res = await apiFetch('api/index.php?route=tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: newStatus }),
            });

            if (res.ok) {
                setTimeout(() => {
                    fetchTasks(pagination.currentPage);
                }, 2000);

                if (newStatus === 1) {
                    triggerNeonConfetti(theme);
                    if (fetchUserStats) {
                        await fetchUserStats();
                    }
                }
            } else {
                fetchTasks(pagination.currentPage);
            }
        } catch (err) {
            console.error("Error updating task", err);
            fetchTasks(pagination.currentPage);
        }
    }, [pagination.currentPage, theme, fetchTasks, fetchUserStats]);

    const handleUpdateTask = useCallback(async (task, updates) => {
        try {
            const body = typeof updates === 'string'
                ? { id: task.id, title: updates }
                : { id: task.id, ...updates };

            const res = await apiFetch('api/index.php?route=tasks', {
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
    }, [pagination.currentPage, fetchTasks]);

    const handleDelete = useCallback(async (id) => {
        try {
            const res = await apiFetch(`api/index.php?route=tasks&id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTasks(pagination.currentPage);
            }
        } catch (err) {
            console.error("Error deleting task", err);
        }
    }, [pagination.currentPage, fetchTasks]);

    return {
        tasks,
        setTasks,
        pagination,
        filters,
        setFilters,
        categories,
        categoryRefreshTrigger,
        refreshCategories,
        fetchCategories,
        fetchTasks,
        handleAddTask,
        handleToggleStatus,
        handleUpdateTask,
        handleDelete
    };
}

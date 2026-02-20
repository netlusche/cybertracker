import { useState, useCallback } from 'react';
import { apiFetch, setCsrfToken } from '../utils/api';
import { useTheme } from '../utils/ThemeContext';
import { triggerNeonConfetti } from '../utils/confetti';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLevelUp, setIsLevelUp] = useState(false);
    const { theme, setThemeState } = useTheme();

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiFetch('api/index.php?route=auth');
            const data = await res.json();
            if (data.isAuthenticated) {
                if (data.csrf_token) {
                    setCsrfToken(data.csrf_token);
                }
                setUser(data.user);
                if (data.user.theme) {
                    setThemeState(data.user.theme);
                }
            }
        } catch (err) {
            console.error("Auth check failed", err);
        } finally {
            setLoading(false);
        }
    }, [setThemeState]);

    const handleLogin = useCallback((userData) => {
        setUser(userData);
        if (userData.theme) {
            setThemeState(userData.theme);
        }
    }, [setThemeState]);

    const handleLogout = useCallback(async () => {
        await apiFetch('api/index.php?route=auth/logout', { method: 'POST' });
        setCsrfToken(null);
        setUser(null);
    }, []);

    const fetchUserStats = useCallback(async () => {
        try {
            const res = await apiFetch('api/index.php?route=user/stats');
            if (res.ok) {
                const data = await res.json();
                setUser(prev => ({ ...prev, ...data }));

                if (data.leveled_up) {
                    triggerNeonConfetti(theme);
                    setIsLevelUp(true);
                    setTimeout(() => setIsLevelUp(false), 5000);
                }
            }
        } catch (err) {
            console.error("Failed to fetch user stats", err);
        }
    }, [theme]);

    // Expose a direct manual setter for localized updates
    const manuallyUpdateUser = useCallback((updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    }, []);

    return {
        user,
        loading,
        isLevelUp,
        checkAuth,
        handleLogin,
        handleLogout,
        fetchUserStats,
        manuallyUpdateUser
    };
}

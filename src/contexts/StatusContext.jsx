import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const StatusContext = createContext();

export function useStatusContext() {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error('useStatusContext must be used within a StatusProvider');
    }
    return context;
}

export function StatusProvider({ children, user }) {
    const [taskStatuses, setTaskStatuses] = useState([]);
    const [statusRefreshTrigger, setStatusRefreshTrigger] = useState(0);

    const refreshTaskStatuses = useCallback(() => setStatusRefreshTrigger(prev => prev + 1), []);

    const fetchTaskStatuses = useCallback(async () => {
        if (!user) {
            setTaskStatuses([]);
            return;
        }
        try {
            const res = await apiFetch('api/index.php?route=task_statuses');
            if (res.ok) {
                const data = await res.json();
                setTaskStatuses(data.data || (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error("Failed to fetch task statuses", err);
        }
    }, [user]);

    const value = {
        taskStatuses,
        statusRefreshTrigger,
        refreshTaskStatuses,
        fetchTaskStatuses
    };

    useEffect(() => {
        fetchTaskStatuses();
    }, [statusRefreshTrigger, fetchTaskStatuses]);

    return (
        <StatusContext.Provider value={value}>
            {children}
        </StatusContext.Provider>
    );
}

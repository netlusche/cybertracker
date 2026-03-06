import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const CategoryContext = createContext();

export function useCategoryContext() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategoryContext must be used within a CategoryProvider');
    }
    return context;
}

export function CategoryProvider({ children, user }) {
    const [categories, setCategories] = useState([]);
    const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);

    const refreshCategories = useCallback(() => setCategoryRefreshTrigger(prev => prev + 1), []);

    const fetchCategories = useCallback(async () => {
        if (!user) {
            setCategories([]);
            return;
        }
        try {
            const res = await apiFetch('api/index.php?route=categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.data || (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    }, [user]);

    const value = {
        categories,
        categoryRefreshTrigger,
        refreshCategories,
        fetchCategories
    };

    useEffect(() => {
        fetchCategories();
    }, [categoryRefreshTrigger, fetchCategories]);

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
}

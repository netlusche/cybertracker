import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, initialTheme = 'cyberpunk' }) => {
    // Try to get theme from localStorage, otherwise use initialTheme
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('cybertasker_theme') || initialTheme;
    });

    // Apply theme class to document body
    useEffect(() => {
        document.body.classList.remove('theme-cyberpunk', 'theme-lcars');
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('cybertasker_theme', theme);
    }, [theme]);

    const setTheme = async (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('cybertasker_theme', newTheme);
        try {
            await fetch('api/auth.php?action=update_theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (err) {
            console.error("Failed to persist theme preference to API", err);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, setThemeState }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

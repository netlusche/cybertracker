import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/ThemeContext';
import CyberSelect from './CyberSelect';

const TaskFilters = ({ filters, onFilterChange, categories }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const isLcars = theme === 'lcars';

    // Sync local search with prop (for reset functionality)
    useEffect(() => {
        setLocalSearch(filters.search || '');
    }, [filters.search]);

    // Handle Search Input (Debounced prop update)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                onFilterChange({ ...filters, search: localSearch });
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [localSearch]);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="mb-6 p-4 border border-cyber-gray bg-black/40 rounded-lg backdrop-blur-sm relative z-20">
            <div className="flex flex-col md:flex-row gap-4 items-center">

                {/* Search Input */}
                <div className="relative w-full md:w-1/3">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-primary">🔍</span>
                    <input
                        type="text"
                        placeholder={t('tasks.search_placeholder')}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-black border border-cyber-gray text-white pl-10 pr-4 py-2 rounded focus:border-cyber-primary focus:shadow-cyber-primary outline-none transition-all placeholder-gray-200 font-mono input-normal-case"
                    />
                </div>

                {/* Category Filter */}
                <CyberSelect
                    value={filters.category || ''}
                    onChange={(val) => handleChange('category', val)}
                    options={[
                        { value: '', label: t('tasks.all_categories') },
                        ...categories.map(cat => ({ value: cat.name || cat, label: cat.name || cat }))
                    ]}
                    className="w-full md:w-56"
                    neonColor="green"
                />

                {/* Priority Filter */}
                <CyberSelect
                    value={filters.priority || ''}
                    onChange={(val) => handleChange('priority', val)}
                    options={[
                        { value: '', label: t('tasks.all_priorities') },
                        { value: '1', label: `${t('common.high')} (1)` },
                        { value: '2', label: `${t('common.med')} (2)` },
                        { value: '3', label: `${t('common.low')} (3)` }
                    ]}
                    className="w-full md:w-48"
                    neonColor={isLcars ? "info" : "pink"}
                />

                {/* Overdue Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-sm font-mono text-gray-300 hover:text-white transition-colors border border-cyber-gray px-3 py-2 rounded hover:border-red-500">
                    <input
                        type="checkbox"
                        checked={filters.overdue || false}
                        onChange={(e) => handleChange('overdue', e.target.checked)}
                        className="hidden" // Custom checkbox style can be added here or just use simple toggle visual
                    />
                    <span className={`w-3 h-3 rounded-full ${filters.overdue ? 'bg-red-500 shadow-cyber-danger' : 'bg-gray-600'}`}></span>
                    {t('tasks.overdue_only')}
                </label>

                {/* Reset Button */}
                <button
                    onClick={() => onFilterChange({ search: '', priority: '', category: '', overdue: false })}
                    className="text-xs text-cyber-primary border border-cyber-primary px-3 py-2 rounded hover:bg-cyber-primary hover:text-black transition-all font-bold ml-auto"
                >
                    {t('common.reset')}
                </button>
            </div>
        </div>
    );
};

export default TaskFilters;

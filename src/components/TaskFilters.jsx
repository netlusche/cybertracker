import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/ThemeContext';
import CyberSelect from './CyberSelect';

const TaskFilters = ({ filters, onFilterChange, categories, hasCompletedTasks, onPurgeCompleted }) => {
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

    const applyPill = (filterUpdate) => {
        // Toggle behavior if the selected filter value is already active
        const updatedFilters = { ...filters };
        for (const [k, v] of Object.entries(filterUpdate)) {
            if (updatedFilters[k] === v) {
                updatedFilters[k] = (typeof v === 'boolean') ? false : '';
            } else {
                updatedFilters[k] = v;
            }
        }
        onFilterChange(updatedFilters);
    };

    const pills = [
        {
            label: t('tasks.filters.pills.overdue'),
            tooltip: t('tasks.filters.pills.overdue_tooltip'),
            isActive: filters.overdue === true,
            onClick: () => applyPill({ overdue: true }),
            activeClass: 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
            inactiveClass: 'border-cyber-gray text-gray-400 hover:border-red-500 hover:text-red-500'
        },
        {
            label: t('tasks.filters.pills.high_prio'),
            tooltip: t('tasks.filters.pills.high_prio_tooltip'),
            isActive: filters.priority === '1',
            onClick: () => applyPill({ priority: '1' }),
            activeClass: 'bg-pink-500/20 border-pink-500 text-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)]',
            inactiveClass: 'border-cyber-gray text-gray-400 hover:border-pink-500 hover:text-pink-500'
        },
        {
            label: t('tasks.filters.pills.completed'),
            tooltip: t('tasks.filters.pills.completed_tooltip'),
            isActive: filters.completed === true,
            onClick: () => applyPill({ completed: true }),
            activeClass: 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]',
            inactiveClass: 'border-cyber-gray text-gray-400 hover:border-blue-500 hover:text-blue-500'
        }
    ];

    return (
        <div className="mb-6 p-4 border border-cyber-gray bg-black/40 rounded-lg backdrop-blur-sm transform-gpu relative z-20">
            <div className="flex flex-col md:flex-row gap-4 md:items-start items-center flex-wrap">

                {/* Search Input */}
                <div className="relative w-full md:w-1/3 xl:w-64 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-primary">🔍</span>
                    <input
                        id="global-search-input"
                        type="text"
                        placeholder={t('tasks.search_placeholder')}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full bg-black border border-cyber-gray text-white pl-10 pr-4 py-2 rounded focus:border-cyber-primary focus:shadow-cyber-primary outline-none transition-all placeholder-gray-200 font-mono input-normal-case"
                    />
                </div>

                {/* Quick-Filter Pills */}
                <div className="flex flex-row flex-wrap gap-2 items-center mr-auto">
                    {pills.map((pill, idx) => (
                        <div key={idx} className="group relative flex items-center">
                            <button
                                onClick={pill.onClick}
                                className={`text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded border transition-all duration-300 uppercase tracking-wider h-[38px] ${pill.isActive ? pill.activeClass : pill.inactiveClass}`}
                            >
                                {pill.label}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute top-full left-0 mt-2 w-48 p-2 bg-black border border-cyber-primary text-cyber-primary text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[60] shadow-cyber-primary hidden md:block">
                                {pill.tooltip}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center items-start flex-wrap mt-4 w-full">
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

                {/* Purge Completed Button */}
                {hasCompletedTasks && (
                    <button
                        onClick={onPurgeCompleted}
                        className="text-[10px] whitespace-nowrap font-bold px-3 py-2 rounded border border-cyber-danger text-cyber-danger shadow-[0_0_8px_rgba(239,68,68,0.2)] hover:bg-cyber-danger/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-300 uppercase tracking-wider"
                        data-tooltip-content={t('tasks.purge_completed_tooltip', 'Permanently delete all completed directives')}
                        data-tooltip-pos="top"
                    >
                        {t('tasks.purge_completed', 'Purge Completed')}
                    </button>
                )}

                {/* Reset Button */}
                <button
                    onClick={() => onFilterChange({ search: '', priority: '', category: '', overdue: false, completed: false })}
                    className="text-xs text-cyber-primary border border-cyber-primary px-3 py-2 rounded hover:bg-cyber-primary hover:text-black transition-all font-bold ml-auto"
                    data-tooltip-content={t('tasks.filters.pills.reset_tooltip', 'Resets all active filters')}
                    data-tooltip-pos="top"
                >
                    {t('common.reset')}
                </button>
            </div>
        </div>
    );
};

export default TaskFilters;

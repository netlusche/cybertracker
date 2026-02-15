import React, { useState, useEffect } from 'react';

const TaskFilters = ({ filters, onFilterChange, categories }) => {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

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
        <div className="mb-6 p-4 border border-cyber-gray bg-black/40 rounded-lg backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center">

                {/* Search Input */}
                <div className="relative w-full md:w-1/3">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-neonCyan">🔍</span>
                    <input
                        type="text"
                        placeholder="Search Neural Database..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full bg-black border border-cyber-gray text-white pl-10 pr-4 py-2 rounded focus:border-cyber-neonCyan focus:shadow-[0_0_10px_#00ffff] outline-none transition-all placeholder-gray-600 font-mono"
                    />
                </div>

                {/* Priority Filter */}
                <select
                    value={filters.priority || ''}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="bg-black border border-cyber-gray text-white px-4 py-2 rounded focus:border-cyber-neonPink outline-none font-mono w-full md:w-auto"
                >
                    <option value="">ALL PRIORITIES</option>
                    <option value="1">HIGH (1)</option>
                    <option value="2">MED (2)</option>
                    <option value="3">LOW (3)</option>
                </select>

                {/* Category Filter */}
                <select
                    value={filters.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="bg-black border border-cyber-gray text-white px-4 py-2 rounded focus:border-cyber-neonGreen outline-none font-mono w-full md:w-auto"
                >
                    <option value="">ALL CATEGORIES</option>
                    {categories.map((cat, idx) => (
                        <option key={idx} value={cat.name || cat}>
                            {cat.name || cat}
                        </option>
                    ))}
                </select>

                {/* Overdue Toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-sm font-mono text-gray-300 hover:text-white transition-colors border border-cyber-gray px-3 py-2 rounded hover:border-red-500">
                    <input
                        type="checkbox"
                        checked={filters.overdue || false}
                        onChange={(e) => handleChange('overdue', e.target.checked)}
                        className="hidden" // Custom checkbox style can be added here or just use simple toggle visual
                    />
                    <span className={`w-3 h-3 rounded-full ${filters.overdue ? 'bg-red-500 shadow-[0_0_8px_#ff0000]' : 'bg-gray-600'}`}></span>
                    OVERDUE ONLY
                </label>

                {/* Reset Button */}
                <button
                    onClick={() => onFilterChange({ search: '', priority: '', category: '', overdue: false })}
                    className="text-xs text-cyber-neonCyan border border-cyber-neonCyan px-3 py-2 rounded hover:bg-cyber-neonCyan hover:text-black transition-all font-bold ml-auto"
                >
                    RESET
                </button>
            </div>
        </div>
    );
};

export default TaskFilters;

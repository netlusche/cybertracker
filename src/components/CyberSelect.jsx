import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CyberSelect = ({ value, onChange, options, label, className = "", neonColor = "cyan" }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // ... existing state mapping logic skipped for brevity if possible, but replace_file_content needs full block
    const neonClass = {
        cyan: 'border-cyber-neonCyan shadow-[0_0_10px_rgba(0,255,255,0.3)] focus:shadow-[0_0_15px_#00ffff]',
        pink: 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)] focus:shadow-[0_0_15px_#ff00ff]',
        green: 'border-cyber-neonGreen shadow-[0_0_10px_rgba(0,255,0,0.3)] focus:shadow-[0_0_15px_#00ff00]',
        gray: 'border-cyber-gray shadow-none focus:border-cyber-neonCyan focus:shadow-[0_0_10px_#00ffff]'
    }[neonColor] || 'border-cyber-neonCyan shadow-[0_0_10px_rgba(0,255,255,0.3)]';

    const activeNeonClass = {
        cyan: 'border-cyber-neonCyan shadow-[0_0_15px_#00ffff]',
        pink: 'border-cyber-neonPink shadow-[0_0_15px_#ff00ff]',
        green: 'border-cyber-neonGreen shadow-[0_0_15px_#00ff00]',
        gray: 'border-cyber-neonCyan shadow-[0_0_15px_#00ffff]'
    }[neonColor] || 'border-cyber-neonCyan shadow-[0_0_15px_#00ffff]';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => (opt.value || opt) === value);
    const displayValue = selectedOption ? (selectedOption.label || selectedOption.name || selectedOption) : label || t('common.select');

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                tabIndex="0"
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    } else if (e.key === 'Escape') {
                        setIsOpen(false);
                    }
                }}
                onClick={() => setIsOpen(!isOpen)}
                className={`input-cyber flex items-center justify-between cursor-pointer min-w-[120px] transition-all duration-200 outline-none ${isOpen ? activeNeonClass : neonClass}`}
            >
                <span className="truncate pr-2 font-mono uppercase tracking-wider text-sm">
                    {displayValue}
                </span>
                <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-cyber-neonCyan'}`}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute z-[1000] w-full mt-1 bg-black border border-cyber-neonCyan shadow-[0_0_30px_rgba(0,0,0,0.9)] max-h-60 overflow-y-auto backdrop-blur-xl bg-opacity-95 rounded-sm"
                >
                    {options.map((opt, idx) => {
                        const optValue = opt.value || opt.name || opt;
                        const optLabel = opt.label || opt.name || opt;
                        const isSelected = optValue === value;

                        return (
                            <li
                                key={idx}
                                role="option"
                                aria-selected={isSelected}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onChange(optValue);
                                }}
                                className={`px-4 py-2 cursor-pointer font-mono text-sm uppercase tracking-widest transition-colors hover:bg-cyber-neonCyan hover:text-black ${isSelected ? 'bg-cyber-neonCyan/20 text-cyber-neonCyan' : 'text-gray-300'}`}
                            >
                                {optLabel} {opt.is_default ? t('tasks.default_suffix') : ''}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default CyberSelect;

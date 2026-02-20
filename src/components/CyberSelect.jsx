import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CyberSelect = ({ value, onChange, options, label, className = "", neonColor = "cyan" }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // ... existing state mapping logic skipped for brevity if possible, but replace_file_content needs full block
    const neonClass = {
        cyan: 'border-cyber-primary shadow-cyber-primary focus:shadow-cyber-primary',
        pink: 'border-cyber-secondary shadow-cyber-secondary focus:shadow-cyber-secondary',
        green: 'border-cyber-success shadow-cyber-success focus:shadow-cyber-success',
        info: 'border-[#4455ff] shadow-cyber-info focus:shadow-cyber-info',
        gray: 'border-cyber-gray shadow-none focus:border-cyber-primary focus:shadow-cyber-primary'
    }[neonColor] || 'border-cyber-primary shadow-cyber-primary';

    const activeNeonClass = {
        cyan: 'border-cyber-primary shadow-cyber-primary',
        pink: 'border-cyber-secondary shadow-cyber-secondary',
        green: 'border-cyber-success shadow-cyber-success',
        info: 'border-[#4455ff] shadow-cyber-info',
        gray: 'border-cyber-primary shadow-cyber-primary'
    }[neonColor] || 'border-cyber-primary shadow-cyber-primary';

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
                <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-cyber-primary'}`}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <ul
                    role="listbox"
                    className="absolute z-[1000] w-full mt-1 bg-black border border-cyber-primary shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl bg-opacity-95 rounded-sm"
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
                                className={`px-4 py-2 cursor-pointer font-mono text-sm uppercase tracking-widest transition-colors hover:bg-cyber-primary hover:text-black ${isSelected ? 'bg-cyber-primary/20 text-cyber-primary' : 'text-gray-300'}`}
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

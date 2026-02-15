import React, { useState, useEffect, useRef } from 'react';
import CyberCalendar from './CyberCalendar';

const CyberDateInput = ({ value, onChange, placeholder = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDateDisplay = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString();
    };

    const handleDateSelect = (date) => {
        onChange(date);
        setIsOpen(false);
    };

    return (
        <div className="relative w-auto" ref={containerRef}>
            {/* Input Trigger */}
            <div
                tabIndex="0"
                role="button"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (isOpen) {
                            setIsOpen(false);
                        } else {
                            const form = containerRef.current?.closest('form');
                            if (form) form.requestSubmit();
                        }
                    } else if (e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                onClick={() => setIsOpen(!isOpen)}
                className={`input-cyber flex items-center justify-between cursor-pointer min-w-[140px] focus:outline-none focus:border-cyber-neonCyan focus:shadow-[0_0_10px_#00ffff] ${isOpen ? 'border-cyber-neonPink shadow-[0_0_10px_#ff00ff]' : ''}`}
            >
                <span className="text-white">
                    {value ? formatDateDisplay(value) : placeholder}
                </span>
                <span className="text-cyber-neonCyan ml-2">📅</span>
            </div>

            {/* Calendar Overlay */}
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 z-[100]">
                    <CyberCalendar
                        value={value}
                        onChange={handleDateSelect}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default CyberDateInput;

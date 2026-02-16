import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const calendarHeight = 320; // Estimated height
            const calendarWidth = 260; // Estimated width

            let top = rect.bottom + window.scrollY + 8;
            let left = rect.left + window.scrollX;

            // Adjust if cut off at the bottom
            if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
                top = rect.top + window.scrollY - calendarHeight - 8;
            }

            // Adjust if cut off at the right
            if (left + calendarWidth > window.innerWidth) {
                left = window.innerWidth - calendarWidth - 20;
            }

            // Ensure not cut off at the left
            if (left < 10) left = 10;

            setCoords({ top, left });
        }
    }, [isOpen]);

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

            {/* Calendar Overlay - Portaled to Body */}
            {isOpen && createPortal(
                <div
                    className="fixed z-[10000]"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        position: 'absolute'
                    }}
                >
                    <CyberCalendar
                        value={value}
                        onChange={handleDateSelect}
                        onClose={() => setIsOpen(false)}
                    />
                </div>,
                document.body
            )}

        </div>
    );
};

export default CyberDateInput;

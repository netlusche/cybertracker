import React, { useState, useEffect } from 'react';

const CyberCalendar = ({ value, onChange, onClose }) => {
    // viewDate controls the month/year currently visible in the calendar
    const [viewDate, setViewDate] = useState(new Date());

    // Initialize viewDate from value if present
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewDate(date);
            }
        }
    }, [value]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return (day === 0 ? 6 : day - 1);
    };

    const handlePrevMonth = (e) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleYearChange = (offset) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + offset);
        setViewDate(newDate);
    };

    const handleDateClick = (day) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const selectedDate = new Date(year, month, day, 12, 0, 0);

        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');

        onChange(`${yyyy}-${mm}-${dd}`);
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const slots = [];

        for (let i = 0; i < firstDay; i++) {
            slots.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const selected = value ? new Date(value) : null;

        for (let day = 1; day <= daysInMonth; day++) {
            let isToday = isCurrentMonth && day === today.getDate();
            let isSelected = selected &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day;

            let cellClass = "p-2 text-center cursor-pointer text-sm font-mono transition-colors hover:bg-cyber-neonGreen hover:text-black";

            if (isSelected) {
                cellClass += " bg-cyber-neonPink text-black font-bold shadow-[0_0_10px_#ff00ff]";
            } else if (isToday) {
                cellClass += " border border-cyber-neonCyan text-cyber-neonCyan";
            } else {
                cellClass += " text-gray-300";
            }

            slots.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={cellClass}
                >
                    {day}
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="w-64 calendar-container bg-cyber-black border border-cyber-neonCyan shadow-[0_0_20px_rgba(0,255,255,0.3)] p-2 animate-in fade-in zoom-in-95 duration-150 relative">

            {/* Header */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                <div className="flex gap-1">
                    <button type="button" onClick={() => handleYearChange(-1)} className="text-cyber-neonCyan hover:text-white px-1 font-bold text-xs">{'<<'}</button>
                    <button type="button" onClick={handlePrevMonth} className="text-cyber-neonCyan hover:text-white px-1">&lt;</button>
                </div>
                <span className="text-cyber-neonPink font-bold uppercase tracking-wider text-sm">
                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <div className="flex gap-1">
                    <button type="button" onClick={handleNextMonth} className="text-cyber-neonCyan hover:text-white px-1">&gt;</button>
                    <button type="button" onClick={() => handleYearChange(1)} className="text-cyber-neonCyan hover:text-white px-1 font-bold text-xs">{'>>'}</button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] text-gray-500 font-bold">{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
            </div>

            {/* Clear Button if value exists */}
            {value && (
                <div className="mt-2 pt-2 border-t border-gray-800 text-center">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); onClose(); }}
                        className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest hover:underline"
                    >
                        Clear Date
                    </button>
                </div>
            )}
        </div>
    );
};

export default CyberCalendar;

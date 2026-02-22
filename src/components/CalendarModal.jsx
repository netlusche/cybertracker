import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/ThemeContext';

const CalendarModal = ({ tasks, onClose, onOpenDossier }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarTasks, setCalendarTasks] = useState([]);

    useEffect(() => {
        // Fetch all calendar tasks regardless of dashboard pagination
        fetch('api/index.php?route=tasks/calendar')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCalendarTasks(data);
                else setCalendarTasks(data.data || []);
            })
            .catch(err => console.error("Failed to fetch calendar tasks", err));
    }, [tasks]); // Re-fetch when dashboard tasks change (ensures syncing after edits)

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthNames = [
        t('calendar.months.0', 'JANUARY'), t('calendar.months.1', 'FEBRUARY'), t('calendar.months.2', 'MARCH'),
        t('calendar.months.3', 'APRIL'), t('calendar.months.4', 'MAY'), t('calendar.months.5', 'JUNE'),
        t('calendar.months.6', 'JULY'), t('calendar.months.7', 'AUGUST'), t('calendar.months.8', 'SEPTEMBER'),
        t('calendar.months.9', 'OCTOBER'), t('calendar.months.10', 'NOVEMBER'), t('calendar.months.11', 'DECEMBER')
    ];

    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Adjust startDay for Monday as first day if preferred, or keep Sunday as 0
    // Let's keep Sunday = 0, Monday = 1 ...

    const renderCalendarGrid = () => {
        const grid = [];
        let dayCounter = 1;

        // Header
        const dayNames = [
            t('calendar.days.0', 'SUN'), t('calendar.days.1', 'MON'), t('calendar.days.2', 'TUE'),
            t('calendar.days.3', 'WED'), t('calendar.days.4', 'THU'), t('calendar.days.5', 'FRI'),
            t('calendar.days.6', 'SAT')
        ];
        grid.push(
            <div key="header" className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-[10px] md:text-sm font-bold text-cyber-secondary border-b border-cyber-secondary/50 pb-1">
                        {day}
                    </div>
                ))}
            </div>
        );

        // Days
        const weeks = Math.ceil((days + startDay) / 7);
        const gridCells = [];

        for (let i = 0; i < weeks * 7; i++) {
            if (i < startDay || dayCounter > days) {
                gridCells.push(<div key={`empty-${i}`} className="bg-black/20 border border-transparent p-1 md:p-2 min-h-[60px] md:min-h-[80px]" />);
            } else {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
                // Using local date string comparison can be tricky, but since we are matching YYYY-MM-DD
                const dayTasks = calendarTasks.filter(t => {
                    if (!t.due_date) return false;
                    const cleanDueDate = t.due_date.split('T')[0]; // Extract YYYY-MM-DD from '2025-02-18' or '2025-02-18 00:00:00'
                    return cleanDueDate === dateStr;
                });

                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                gridCells.push(
                    <div key={dayCounter} className={`relative p-1 md:p-2 min-h-[60px] md:min-h-[80px] flex flex-col group transition-colors overflow-hidden ${isToday ? 'border border-cyber-primary bg-cyber-primary/10 shadow-[inner_0_0_10px_rgba(0,255,255,0.2)]' : 'border border-gray-800 hover:border-cyber-primary/50 hover:bg-white/5'}`}>
                        <span className={`text-xs md:text-sm font-bold mb-1 ${isToday ? 'text-cyber-primary' : 'text-gray-400 group-hover:text-white'}`}>
                            {dayCounter}
                        </span>
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {dayTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => onOpenDossier(task)}
                                    className={`text-[8px] md:text-[10px] truncate px-1 border-l-2 cursor-pointer transition-colors bg-black/40 hover:bg-cyber-primary/20 hover:text-white ${task.priority == 1 ? 'border-red-500 text-red-400' : task.priority == 2 ? 'border-cyber-warning text-cyber-warning' : 'border-green-500 text-green-400'}`}
                                >
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                dayCounter++;
            }
        }

        grid.push(
            <div key="days" className="grid grid-cols-7 gap-1 md:gap-2">
                {gridCells}
            </div>
        );

        return grid;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-cyber-black border border-cyber-primary p-4 md:p-6 shadow-cyber-primary relative z-10 w-full max-w-5xl flex flex-col font-mono" style={{ maxHeight: '90vh' }}>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-cyber-primary flex items-center gap-2 uppercase tracking-widest">
                        <span>📅</span> {t('calendar.title', 'CHRONO-SYNC // CALENDAR')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl font-bold leading-none px-2 py-1">
                        &times;
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 bg-cyber-primary/10 border border-cyber-primary/30 p-2 md:p-4 rounded-sm">
                    <button onClick={prevMonth} className="btn-cyber min-w-[3rem] px-2 py-1 flex items-center justify-center border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black">
                        &#9664;
                    </button>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-widest uppercase">
                        {monthNames[month]} <span className="text-cyber-secondary">{year}</span>
                    </h3>
                    <button onClick={nextMonth} className="btn-cyber min-w-[3rem] px-2 py-1 flex items-center justify-center border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black">
                        &#9654;
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {renderCalendarGrid()}
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;

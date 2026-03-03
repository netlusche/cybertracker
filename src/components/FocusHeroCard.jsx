import React from 'react';
import { useTranslation } from 'react-i18next';
import CyberSelect from './CyberSelect';

const FocusHeroCard = ({
    task,
    categories,
    taskStatuses = [],
    onToggleStatus,
    onUpdateTask,
    onSkip,
    onOpenDossier,
    isSkipping = false,
    isCompleting = false
}) => {
    const { t } = useTranslation();

    const isConfirming = React.useRef(false);

    if (!task) {
        return (
            <div className="card-cyber w-full max-w-3xl mx-auto border-cyber-success shadow-[0_0_20px_var(--theme-success)] animate-pulse">
                <div className="text-center py-12">
                    <h2 className="text-3xl font-bold text-cyber-success mb-2">{t('tasks.focus_all_caught_up')}</h2>
                    <p className="opacity-70 font-mono">{t('tasks.focus_no_urgent')}</p>
                </div>
            </div>
        );
    }

    const displayTitle = task.title?.startsWith('i18n:') ? t(task.title.replace('i18n:', '')) : task.title;
    const displayDesc = task.description?.startsWith('i18n:') ? t(task.description.replace('i18n:', '')) : task.description;

    const handleWorkflowStatusChange = async (newStatus) => {
        if (task.status == 1 || isConfirming.current) return;

        if (newStatus === 'completed') {
            onToggleStatus(task);
            return;
        }

        try {
            isConfirming.current = true;
            await onUpdateTask(task, { workflow_status: newStatus });
        } catch (err) {
            console.error("Workflow status update error:", err);
        } finally {
            isConfirming.current = false;
        }
    };

    const handleComplete = () => {
        if (!isCompleting && !isSkipping) {
            onToggleStatus(task);
        }
    };

    const isOverdue = task.due_date && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

    // Priority styling adapted for massive card
    const priorityBorders = {
        1: 'border-cyber-danger shadow-[0_0_30px_var(--theme-danger)]',   // High
        2: 'border-cyber-warning shadow-[0_0_30px_var(--theme-warning)]', // Medium
        3: 'border-cyber-success shadow-[0_0_30px_var(--theme-success)]',  // Low
    };

    const borderStyle = isOverdue
        ? 'border-cyber-danger shadow-[0_0_40px_var(--theme-danger)] animate-pulse-slow'
        : (priorityBorders[task.priority] || 'border-cyber-primary shadow-[0_0_30px_var(--theme-primary)]');

    return (
        <div className={`relative transition-all duration-500 ${isSkipping ? 'opacity-0 translate-x-[-100%]' : 'opacity-100 translate-x-0'} ${isCompleting ? 'opacity-0 scale-110' : ''}`}>
            {/* Header / Meta info */}
            <div className="flex justify-between items-end mb-4 px-2">
                <div className="flex gap-3 items-center">
                    <span className="text-xs font-bold font-mono px-2 py-1 border border-cyber-primary text-cyber-primary uppercase">
                        {task.category || 'GENERAL'}
                    </span>
                    {task.due_date && (
                        <span className={`text-xs font-bold font-mono px-2 py-1 border uppercase flex items-center gap-2 ${isOverdue ? 'border-cyber-danger text-cyber-danger' : 'border-cyber-secondary text-cyber-secondary'}`}>
                            🕒 {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue && <span className="animate-pulse">CRITICAL</span>}
                        </span>
                    )}
                </div>
                {taskStatuses.length > 0 && (
                    <div className="w-[160px] relative z-50">
                        <CyberSelect
                            value={task.workflow_status || 'open'}
                            onChange={handleWorkflowStatusChange}
                            options={taskStatuses.map(status => ({
                                value: status.name,
                                label: status.is_system ? t(`tasks.status_${status.name.toLowerCase().replace(' ', '_')}`, status.name) : status.name
                            }))}
                            neonColor="cyan"
                            className="text-xs font-bold h-8 uppercase tracking-wider backdrop-blur-md"
                            disabled={task.status == 1}
                        />
                    </div>
                )}
            </div>

            {/* Main Card */}
            <div className={`card-cyber border-2 rounded-lg p-6 md:p-10 backdrop-blur-md ${borderStyle}`}>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    {displayTitle}
                </h2>

                {displayDesc && (
                    <div className="mb-10 p-4 border-l-4 border-cyber-primary/50 opacity-80 font-mono text-lg leading-relaxed whitespace-pre-wrap">
                        {displayDesc}
                    </div>
                )}

                {/* Indicators & Dossier Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-y border-white/10 py-5">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* File Indicator */}
                        {(() => {
                            let hasFiles = false;
                            try {
                                if (task.attachments && JSON.parse(task.attachments).length > 0) hasFiles = true;
                                if (task.files && JSON.parse(task.files).length > 0) hasFiles = true;
                            } catch (e) {
                                if (task.attachments?.length > 10 || task.files?.length > 10) hasFiles = true;
                            }

                            if (hasFiles) {
                                return (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-primary/20 text-sm text-cyber-primary font-mono" data-tooltip-content={t('tasks.attachments_indicator')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                        </svg>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Subroutines Indicator */}
                        {(() => {
                            let subTotal = 0;
                            let subCompleted = 0;
                            try {
                                if (task.subroutines_json && typeof task.subroutines_json === 'string') {
                                    const parsed = JSON.parse(task.subroutines_json);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        subTotal = parsed.length;
                                        subCompleted = parsed.filter(s => s.completed).length;
                                    }
                                }
                            } catch (e) {
                                console.warn("Could not parse subroutines JSON in FocusHeroCard", e);
                            }

                            if (subTotal > 0) {
                                const isAllCompleted = subCompleted === subTotal;
                                return (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-primary/20 text-sm font-mono" data-tooltip-content={t('tasks.subroutines_indicator')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 ${isAllCompleted ? 'text-cyber-success' : 'text-cyber-primary'}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <span className={isAllCompleted ? 'text-cyber-success font-bold' : 'text-cyber-primary/80'}>
                                            [{subCompleted}/{subTotal}]
                                        </span>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Notes Indicator */}
                        {task.notes_count > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-primary/20 text-sm text-cyber-primary font-mono" data-tooltip-content={t('tasks.dossier.notes_title', 'Notes')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span className="font-bold">{task.notes_count}</span>
                            </div>
                        )}

                        {/* Fallback space filler if empty */}
                        {(!task.subroutines_json && task.notes_count == 0 && !task.attachments && !task.files) && (
                            <span className="text-gray-500 font-mono text-xs italic">{t('tasks.focus_no_telemetry', '[ NO ADDITIONAL TELEMETRY ]')}</span>
                        )}
                    </div>

                    {/* Dossier Button */}
                    {onOpenDossier && (
                        <button
                            onClick={() => onOpenDossier(task)}
                            className="bg-transparent border border-cyber-primary/50 text-cyber-primary hover:bg-cyber-primary hover:text-black font-bold px-4 py-2 uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            {t('tasks.details', 'DOSSIER')}
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        onClick={handleComplete}
                        disabled={isCompleting || isSkipping || task.status == 1}
                        className={`flex-1 py-6 text-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 border-2 
                            ${isCompleting
                                ? 'bg-cyber-success text-black border-cyber-success shadow-[0_0_30px_var(--theme-success)]'
                                : 'bg-transparent text-cyber-success border-cyber-success hover:bg-cyber-success hover:text-black hover:shadow-[0_0_20px_var(--theme-success)]'
                            }
                        `}
                        data-tooltip-content={t('tasks.focus_complete_tooltip', 'Mark directive as completed')}
                    >
                        {isCompleting ? t('tasks.focus_executing') : t('tasks.mark_done')}
                    </button>

                    <button
                        onClick={onSkip}
                        disabled={isCompleting || isSkipping}
                        className="sm:w-1/3 py-6 text-xl font-bold uppercase tracking-wider bg-transparent text-cyber-primary border border-cyber-primary hover:bg-cyber-primary hover:text-black opacity-80 hover:opacity-100 transition-colors"
                        data-tooltip-content={t('tasks.focus_skip_tooltip', 'Skip to the next urgent directive')}
                    >
                        {t('tasks.focus_skip')}
                    </button>
                </div>
            </div>

            <div className="text-center mt-6 text-cyber-warning font-mono text-sm opacity-80">
                {t('tasks.focus_active')}
            </div>
        </div>
    );
};

export default FocusHeroCard;

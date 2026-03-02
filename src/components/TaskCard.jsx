import React from 'react';
import { useTranslation } from 'react-i18next';
import CyberSelect from './CyberSelect';
import CyberConfirm from './CyberConfirm';
import CyberCalendar from './CyberCalendar';
import DirectiveModal from './DirectiveModal';

const TaskCard = ({ task, categories, taskStatuses = [], onToggleStatus, onUpdateTask, onDelete, activeCalendarTaskId, setActiveCalendarTaskId, onDuplicate }) => {
    const { t } = useTranslation();
    const displayTitle = task.title?.startsWith('i18n:') ? t(task.title.replace('i18n:', '')) : task.title;
    const displayDesc = task.description?.startsWith('i18n:') ? t(task.description.replace('i18n:', '')) : task.description;

    const [isEditing, setIsEditing] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(displayTitle);
    const [isSaving, setIsSaving] = React.useState(false);
    const [showPriorityConfirm, setShowPriorityConfirm] = React.useState(false);
    const [pendingPriority, setPendingPriority] = React.useState(null);
    const [showDateConfirm, setShowDateConfirm] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showDossier, setShowDossier] = React.useState(false);
    const [pendingDate, setPendingDate] = React.useState(null);
    const [openUpwards, setOpenUpwards] = React.useState(false);
    const cardRef = React.useRef(null);
    const isDatePickerOpen = activeCalendarTaskId === task.id;

    // Mutual Exclusion & Positioning Logic
    React.useEffect(() => {
        if (!isDatePickerOpen) return;

        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setActiveCalendarTaskId(null);
            }
        };

        const checkPosition = () => {
            if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                // If less than 280px (approx calendar height) space below, flip it
                setOpenUpwards(spaceBelow < 280);
            }
        };

        checkPosition();
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', checkPosition);
        window.addEventListener('resize', checkPosition);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', checkPosition);
            window.removeEventListener('resize', checkPosition);
        };
    }, [isDatePickerOpen, setActiveCalendarTaskId]);

    const priorityColors = {
        1: 'border-l-4 border-red-500',   // High
        2: 'border-l-4 border-cyber-warning', // Medium
        3: 'border-l-4 border-green-500',  // Low
    };

    const priorityLabels = {
        1: 'HIGH',
        2: 'MED',
        3: 'LOW',
    };

    const isConfirming = React.useRef(false);

    const handleCategoryChange = async (newCategory) => {
        if (task.status == 1 || isConfirming.current) return;
        try {
            isConfirming.current = true;
            await onUpdateTask(task, { category: newCategory });
        } catch (err) {
            console.error("Category update error:", err);
        } finally {
            isConfirming.current = false;
        }
    };

    const handlePriorityChange = (newPriority) => {
        const pNum = Number(newPriority);
        const currentPNum = Number(task.priority);

        if (task.status == 1 || pNum === currentPNum || isConfirming.current) return;

        setPendingPriority(pNum);
        setShowPriorityConfirm(true);
    };

    const confirmPriorityUpdate = async () => {
        const pNum = pendingPriority;
        setShowPriorityConfirm(false);
        setPendingPriority(null);

        if (!pNum || isConfirming.current) return;

        try {
            isConfirming.current = true;
            await onUpdateTask(task, { priority: pNum });
        } catch (err) {
            console.error("Priority update error:", err);
        } finally {
            isConfirming.current = false;
        }
    };

    const cancelPriorityUpdate = () => {
        setShowPriorityConfirm(false);
        setPendingPriority(null);
    };

    const handleDateSelect = (date) => {
        setPendingDate(date);
        setActiveCalendarTaskId(null);
        setShowDateConfirm(true);
    };

    const confirmDateUpdate = async () => {
        const dateStr = pendingDate;
        setShowDateConfirm(false);
        setPendingDate(null);

        if (isConfirming.current) return;

        try {
            isConfirming.current = true;
            await onUpdateTask(task, { due_date: dateStr });
        } catch (err) {
            console.error("Date update error:", err);
        } finally {
            isConfirming.current = false;
        }
    };

    const cancelDateUpdate = () => {
        setShowDateConfirm(false);
        setPendingDate(null);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        await onDelete(task.id);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleSave = async () => {
        if (editTitle.trim() && editTitle !== task.title) {
            setIsSaving(true);
            // simulated delay for effect
            await new Promise(resolve => setTimeout(resolve, 500));
            await onUpdateTask(task, { title: editTitle });
        }
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleWorkflowStatusChange = async (newStatus) => {
        if (task.status == 1 || isConfirming.current) return;

        // If they select "completed" from the dropdown, trigger the toggle logic 
        // to get the confetti and XP, rather than just silently updating the string.
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(displayTitle);
            setIsEditing(false);
        }
    };

    const priorityNeonColors = {
        1: 'pink',
        2: 'cyan',
        3: 'green'
    };

    return (
        <>
            <div ref={cardRef} className={`card-cyber relative group transition-all duration-300 card-priority-${task.priority} ${isDatePickerOpen ? 'z-[100]' : 'hover:z-50 focus-within:z-50'} ${task.status == 1 ? 'opacity-50 grayscale' : ''} ${priorityColors[task.priority] || ''}`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="min-w-[5rem] w-auto max-w-[8rem]">
                                <CyberSelect
                                    value={task.category}
                                    onChange={handleCategoryChange}
                                    options={(Array.isArray(categories) && categories.length > 0 ? categories : [{ name: task.category }]).map(cat => {
                                        const catName = cat.name || cat;
                                        return { value: catName, label: catName };
                                    })}
                                    neonColor="green"
                                    className="text-[10px] font-bold h-7 uppercase tracking-wider"
                                    disabled={task.status == 1}
                                />
                            </div>

                            <div className="w-[120px]">
                                <CyberSelect
                                    value={String(task.priority)}
                                    onChange={handlePriorityChange}
                                    options={[
                                        { value: '1', label: t('common.high') },
                                        { value: '2', label: t('common.med') },
                                        { value: '3', label: t('common.low') }
                                    ]}
                                    neonColor={priorityNeonColors[task.priority]}
                                    className="text-[10px] font-bold h-7"
                                    wrapperClassName={`marvel-select-prio-${task.priority}`}
                                    disabled={task.status == 1}
                                />
                            </div>

                            {taskStatuses.length > 0 && (
                                <div className="w-[140px]">
                                    <CyberSelect
                                        value={task.workflow_status || 'open'}
                                        onChange={handleWorkflowStatusChange}
                                        options={taskStatuses.map(status => ({
                                            value: status.name,
                                            label: status.is_system ? t(`tasks.status_${status.name.toLowerCase().replace(' ', '_')}`, status.name) : status.name
                                        }))}
                                        neonColor="cyan"
                                        className="text-[9px] font-bold h-7 uppercase tracking-wider"
                                        disabled={task.status == 1}
                                    />
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-1 mr-4">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSave}
                                    disabled={isSaving}
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    maxLength={255}
                                    className={`bg-black/50 border text-white px-2 py-1 w-full text-lg font-bold focus:outline-none transition-all duration-300 input-normal-case ${isSaving ? 'border-cyber-success shadow-cyber-success text-cyber-success' : 'border-cyber-primary shadow-cyber-primary animate-pulse'}`}
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`hover:text-white transition-colors ${isSaving ? 'text-cyber-success animate-spin' : 'text-cyber-success'}`}
                                >
                                    {isSaving ? '⏳' : '✓'}
                                </button>
                            </div>
                        ) : (
                            <h3
                                onClick={() => {
                                    if (task.status != 1) {
                                        setEditTitle(displayTitle);
                                        setIsEditing(true);
                                    }
                                }}
                                className={`text-lg font-bold text-white mb-1 cursor-pointer hover:text-cyber-primary transition-colors ${task.status == 1 ? 'line-through text-gray-400 pointer-events-none' : ''}`}
                                data-tooltip-content={task.status != 1 ? t('tooltip.edit') : null}
                                data-tooltip-pos="bottom"
                            >
                                {displayTitle}
                            </h3>
                        )}

                        {displayDesc && !isEditing && (
                            <div
                                className="mb-2 cursor-pointer group/preview px-1 -mx-1 rounded hover:bg-white/5 transition-colors"
                                onClick={() => setShowDossier(true)}
                                data-tooltip-content={t('tooltip.dossier')}
                                data-tooltip-pos="bottom"
                            >
                                <p className="line-clamp-2 text-xs text-gray-400 font-mono opacity-80 group-hover/preview:opacity-100 group-hover/preview:text-cyber-primary transition-colors whitespace-pre-wrap">
                                    {displayDesc.length > 256 ? displayDesc.substring(0, 256) + '...' : displayDesc}
                                </p>
                            </div>
                        )}

                        <div className="relative">
                            <div
                                onClick={() => task.status != 1 && setActiveCalendarTaskId(isDatePickerOpen ? null : task.id)}
                                className={`flex w-fit items-center gap-2 mb-2 font-mono text-base ${task.status != 1 ? 'cursor-pointer hover:bg-white/5 transition-colors p-1 -ml-1 rounded' : ''}`}
                                data-tooltip-content={task.status != 1 ? t('tooltip.calendar') : null}
                            >
                                <span className="text-cyber-secondary xp-text">🕒</span>
                                <span className={
                                    task.due_date && new Date(task.due_date) < new Date() && task.status != 1
                                        ? "text-red-500 font-bold"
                                        : "text-gray-300"
                                }>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : t('tasks.no_date')}
                                </span>
                            </div>

                            {isDatePickerOpen && (
                                <div className={`absolute left-0 z-[100] mt-1 ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                                    <CyberCalendar
                                        value={task.due_date}
                                        onChange={handleDateSelect}
                                        onClose={() => setActiveCalendarTaskId(null)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 items-center mb-2">
                            <p className="text-sm text-cyber-secondary font-mono xp-text">
                                +{task.points_value} XP
                            </p>

                            {/* File Indicator */}
                            {(() => {
                                let hasFiles = false;
                                try {
                                    if (task.attachments && JSON.parse(task.attachments).length > 0) hasFiles = true;
                                    if (task.files && JSON.parse(task.files).length > 0) hasFiles = true;
                                } catch (e) {
                                    if (task.attachments?.length > 10 || task.files?.length > 10) hasFiles = true; // Fallback for simple strings that aren't empty arrays
                                }

                                if (hasFiles) {
                                    return (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-cyber-primary/20 text-xs text-cyber-primary font-mono" data-tooltip-content={t('tasks.attachments_indicator')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                            </svg>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {(() => {
                                let subTotal = 0;
                                let subCompleted = 0;
                                try {
                                    if (task.subroutines_json) {
                                        const parsed = JSON.parse(task.subroutines_json);
                                        if (Array.isArray(parsed) && parsed.length > 0) {
                                            subTotal = parsed.length;
                                            subCompleted = parsed.filter(s => s.completed).length;
                                        }
                                    }
                                } catch (e) {
                                    console.error('Error parsing subroutines:', e);
                                }

                                if (subTotal > 0) {
                                    const isAllCompleted = subCompleted === subTotal;
                                    return (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-cyber-primary/20 text-xs font-mono" data-tooltip-content={t('tasks.subroutines_indicator')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3 h-3 ${isAllCompleted ? 'text-cyber-success' : 'text-cyber-primary'}`}>
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
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => onToggleStatus(task)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-xl pb-0.5 ${task.status == 1 ? 'bg-cyber-success text-black' : 'bg-transparent border border-gray-500 hover:border-cyber-success hover:text-cyber-success'}`}
                                data-tooltip-content={task.status == 1 ? t('tooltip.mark_todo') : t('tooltip.mark_done')}
                            >
                                {task.status == 1 ? '✓' : '○'}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowDossier(true)}
                            className="min-w-[4rem] w-auto h-auto min-h-8 border border-cyber-primary/40 flex items-center justify-center transition-colors hover:border-cyber-primary hover:bg-cyber-primary/10 text-cyber-primary text-[9px] font-bold px-2 py-1 uppercase leading-none"
                            data-tooltip-content={t('tooltip.dossier')}
                        >
                            {t('tasks.details')}
                        </button>

                        <button
                            onClick={handleDeleteClick}
                            className={`w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 btn-task-delete ${task.status == 1 ? 'text-gray-300 hover:text-white hover:border-gray-400' : 'text-gray-500 hover:border-cyber-danger hover:text-cyber-danger shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-cyber-danger/30'}`}
                            data-tooltip-content={t('tooltip.delete')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {showPriorityConfirm && (
                <CyberConfirm
                    message={t('tasks.priority_confirm')}
                    onConfirm={confirmPriorityUpdate}
                    onCancel={cancelPriorityUpdate}
                />
            )}

            {showDateConfirm && (
                <CyberConfirm
                    message={t('tasks.date_confirm')}
                    onConfirm={confirmDateUpdate}
                    onCancel={cancelDateUpdate}
                />
            )}

            {showDeleteConfirm && (
                <CyberConfirm
                    message={t('tasks.delete_confirm')}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    neonColor="pink"
                />
            )}

            {showDossier && (
                <DirectiveModal
                    task={task}
                    categories={categories}
                    taskStatuses={taskStatuses}
                    onClose={() => setShowDossier(false)}
                    onUpdate={onUpdateTask}
                    onDuplicate={(t) => {
                        setShowDossier(false);
                        if (onDuplicate) onDuplicate(t);
                    }}
                />
            )}
        </>
    );
};

export default TaskCard;

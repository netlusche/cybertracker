import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import CyberConfirm from './CyberConfirm';

const KanbanCard = ({ task, onClick, onDelete }) => {
    const { t } = useTranslation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    const priorityColors = {
        1: 'border-l-4 border-cyber-danger',
        2: 'border-l-4 border-cyber-warning',
        3: 'border-l-4 border-cyber-success',
    };

    const isCompleted = task.status == 1;

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        if (onDelete) onDelete(task.id);
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => onClick(task)}
                className={`card-cyber p-3 mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors relative group ${priorityColors[task.priority] || ''} ${isCompleted ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}
            >
                <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-bold text-white mb-1 line-clamp-2 leading-tight select-none ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                    </h4>

                    <button
                        onClick={handleDeleteClick}
                        className="w-6 h-6 rounded-full border border-transparent flex-shrink-0 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 text-gray-500 hover:border-cyber-danger hover:text-cyber-danger z-10"
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center mt-2 select-none w-full">
                    <div className="text-[10px] text-cyber-secondary font-mono xp-text flex-none min-w-[40px]">
                        +{task.points_value} XP
                    </div>
                    <div className="flex-1 flex justify-center px-2 overflow-hidden">
                        <div className={`text-[8px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase truncate ${isCompleted ? 'border-gray-600 text-gray-500 bg-black/20' : 'border-cyber-primary/30 text-cyber-primary/80 bg-cyber-primary/10'}`} title={task.category || 'GENERAL'}>
                            {task.category || 'GENERAL'}
                        </div>
                    </div>
                    <div className="flex-none text-right min-w-[55px]">
                        {task.due_date && (
                            <div className={`text-[10px] font-mono ${new Date(task.due_date) < new Date() && !isCompleted ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                {new Date(task.due_date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
                <CyberConfirm
                    message={t('tasks.delete_confirm', 'WARNING: DELETION IS PERMANENT. PROCEED?')}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                    neonColor="pink"
                />
            )}
        </>
    );
};

export default KanbanCard;

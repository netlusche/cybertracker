import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: {
            task,
        },
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className={`card-cyber p-3 mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors relative ${priorityColors[task.priority] || ''}`}
        >
            <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight select-none">
                {task.title}
            </h4>
            
            <div className="flex items-center justify-between mt-2 select-none">
                <div className="text-[10px] text-cyber-secondary font-mono xp-text">
                    +{task.points_value} XP
                </div>
                {task.due_date && (
                    <div className={`text-[10px] font-mono ${new Date(task.due_date) < new Date() ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanCard;

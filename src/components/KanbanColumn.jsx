import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import { useTranslation } from 'react-i18next';

const KanbanColumn = ({ status, tasks, onTaskClick, onDelete }) => {
    const { t } = useTranslation();
    const { isOver, setNodeRef } = useDroppable({
        id: status.id, // we'll use string 'open' or the custom status name
        data: { statusName: status.name }
    });

    const displayName = status.is_system
        ? t(`tasks.status_${status.name.toLowerCase().replace(' ', '_')}`, status.name)
        : status.name;

    return (
        <div className="flex flex-col w-72 flex-shrink-0 bg-black/40 border border-cyber-gray/50 rounded-lg overflow-hidden h-full">
            <div className="bg-cyber-gray/20 p-3 border-b border-cyber-gray/50 flex justify-between items-center sticky top-0 z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                <h3 className="font-bold text-cyber-primary tracking-wider uppercase text-sm drop-shadow-[0_0_5px_var(--theme-primary)]">
                    {displayName}
                </h3>
                <span className="text-xs font-mono text-gray-400 bg-black/50 px-2 py-0.5 rounded-full">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors ${isOver ? 'bg-cyber-primary/10' : ''}`}
            >
                {tasks.map(task => (
                    <KanbanCard key={task.id} task={task} onClick={onTaskClick} onDelete={onDelete} />
                ))}

                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs font-mono font-bold uppercase italic opacity-60 select-none pb-8 border-2 border-dashed border-gray-600 rounded m-2">
                        {t('tasks.drop_zone', 'DROP DIRECTIVES HERE')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;

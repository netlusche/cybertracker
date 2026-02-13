import React from 'react';

const TaskCard = ({ task, onToggleStatus, onDelete }) => {
    const priorityColors = {
        1: 'border-l-4 border-red-500',   // High
        2: 'border-l-4 border-yellow-500', // Medium
        3: 'border-l-4 border-green-500',  // Low
    };

    const priorityLabels = {
        1: 'HIGH',
        2: 'MED',
        3: 'LOW',
    };

    return (
        <div className={`card-cyber relative group transition-all duration-300 ${task.status == 1 ? 'opacity-50 grayscale' : ''} ${priorityColors[task.priority] || ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-cyber-neonCyan tracking-wider uppercase border border-cyber-neonCyan px-1 rounded">
                            {task.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {priorityLabels[task.priority]}
                        </span>
                    </div>
                    <h3 className={`text-lg font-bold text-white mb-1 ${task.status == 1 ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                    </h3>
                    <p className="text-xs text-cyber-neonPink font-mono">
                        +{task.points_value} XP
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onToggleStatus(task)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${task.status == 1 ? 'bg-cyber-neonGreen text-black' : 'bg-transparent border border-gray-500 hover:border-cyber-neonGreen hover:text-cyber-neonGreen'}`}
                        title={task.status == 1 ? "Mark as TODO" : "Mark as DONE"}
                    >
                        {task.status == 1 ? '✓' : '○'}
                    </button>

                    <button
                        onClick={() => onDelete(task.id)}
                        className="w-8 h-8 rounded-full border border-gray-600 text-gray-500 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Task"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;

import React from 'react';

const TaskCard = ({ task, onToggleStatus, onUpdateTask, onDelete }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(task.title);
    const [isSaving, setIsSaving] = React.useState(false);

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

    const categories = ['Work', 'Private', 'Health', 'Finance', 'Hobby'];

    const handleCycleCategory = async () => {
        if (task.status == 1) return; // Prevent editing done tasks
        const currentIndex = categories.indexOf(task.category);
        const nextCategory = categories[(currentIndex + 1) % categories.length];
        await onUpdateTask(task, { category: nextCategory });
    };

    const handleCyclePriority = async () => {
        if (task.status == 1) return;
        // Cycle 1 -> 2 -> 3 -> 1
        const nextPriority = (task.priority % 3) + 1;
        await onUpdateTask(task, { priority: nextPriority });
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(task.title);
            setIsEditing(false);
        }
    };

    const priorityTextColors = {
        1: 'text-red-500 border-red-500',     // High
        2: 'text-yellow-500 border-yellow-500', // Med
        3: 'text-green-500 border-green-500',  // Low
    };

    return (
        <div className={`card-cyber relative group transition-all duration-300 ${task.status == 1 ? 'opacity-50 grayscale' : ''} ${priorityColors[task.priority] || ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={handleCycleCategory}
                            disabled={task.status == 1}
                            className={`text-xs font-bold text-cyber-neonCyan tracking-wider uppercase border border-cyber-neonCyan px-2 py-0.5 rounded transition-all ${task.status != 1 ? 'hover:bg-cyber-neonCyan hover:text-black cursor-pointer active:scale-95' : 'cursor-default'}`}
                            title={task.status != 1 ? "Click to cycle category" : ""}
                        >
                            {task.category}
                        </button>
                        <button
                            onClick={handleCyclePriority}
                            disabled={task.status == 1}
                            className={`text-sm font-bold px-2 py-0.5 rounded border transition-all ${priorityTextColors[task.priority]} ${task.status != 1 ? 'hover:bg-white/10 cursor-pointer active:scale-95' : 'cursor-default'}`}
                            title={task.status != 1 ? "Click to cycle priority" : ""}
                        >
                            {priorityLabels[task.priority]}
                        </button>
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
                                className={`bg-black/50 border text-white px-2 py-1 w-full text-lg font-bold focus:outline-none transition-all duration-300 ${isSaving ? 'border-cyber-neonGreen shadow-[0_0_15px_#0f0] text-cyber-neonGreen' : 'border-cyber-neonCyan shadow-[0_0_10px_#0ff] animate-pulse'}`}
                            />
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`hover:text-white transition-colors ${isSaving ? 'text-cyber-neonGreen animate-spin' : 'text-cyber-neonGreen'}`}
                            >
                                {isSaving ? '⏳' : '✓'}
                            </button>
                        </div>
                    ) : (
                        <h3
                            onClick={() => task.status != 1 && setIsEditing(true)}
                            className={`text-lg font-bold text-white mb-1 cursor-pointer hover:text-cyber-neonCyan transition-colors ${task.status == 1 ? 'line-through text-gray-400 pointer-events-none' : ''}`}
                            title={task.status != 1 ? "Click to edit" : ""}
                        >
                            {task.title}
                        </h3>
                    )}

                    {task.due_date && (
                        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-gray-400">
                            <span className="text-cyber-neonPink">🕒</span>
                            <span className={new Date(task.due_date) < new Date() && task.status != 1 ? "text-red-500 font-bold" : ""}>
                                {new Date(task.due_date).toLocaleDateString()}
                            </span>
                        </div>
                    )}

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

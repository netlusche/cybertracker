import React, { useState } from 'react';

const TaskForm = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Work');
    const [priority, setPriority] = useState('2');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAddTask({
            title,
            category,
            priority: parseInt(priority),
            points_value: 10 + (3 - parseInt(priority)) * 5 // 1(High)=20xp, 2(Med)=15xp, 3(Low)=10xp (Logic tweaks)
        });
        setTitle('');
    };

    return (
        <form onSubmit={handleSubmit} className="card-cyber mb-8">
            <h3 className="text-cyber-neonCyan font-bold mb-4 uppercase tracking-wider">New Directive</h3>
            <div className="flex flex-col gap-4">
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task description..."
                        className="input-cyber w-full"
                        maxLength={60}
                    />
                </div>

                <div className="flex gap-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-cyber flex-1"
                    >
                        <option value="Work">Work</option>
                        <option value="Private">Private</option>
                        <option value="Health">Health</option>
                        <option value="Finance">Finance</option>
                        <option value="Hobby">Hobby</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="input-cyber w-32"
                    >
                        <option value="1">High (1)</option>
                        <option value="2">Med (2)</option>
                        <option value="3">Low (3)</option>
                    </select>

                    <button type="submit" className="btn-cyber btn-neon-cyan flex-none">
                        INITIALIZE
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TaskForm;

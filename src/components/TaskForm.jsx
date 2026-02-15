import React, { useState, useEffect } from 'react';
import CyberSelect from './CyberSelect';
import CyberDateInput from './CyberDateInput';

const TaskForm = ({ onAddTask, categoryRefreshTrigger, categories = [] }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('2');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [successFlash, setSuccessFlash] = useState(false);

    // Auto-select default or first available if no selection
    useEffect(() => {
        if (categories.length > 0 && !category) {
            const defaultCat = categories.find(c => c.is_default);
            if (defaultCat) {
                setCategory(defaultCat.name);
            } else {
                setCategory(categories[0].name);
            }
        }
    }, [categories, category]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('DIRECTIVE DESCRIPTION REQUIRED');
            return;
        }

        // Fallback if category is empty
        let selectedCategory = category;
        if (!selectedCategory && categories.length > 0) {
            selectedCategory = categories[0].name;
        } else if (!selectedCategory) {
            selectedCategory = 'General';
        }

        onAddTask({
            title,
            category: selectedCategory,
            priority: parseInt(priority),
            points_value: 10 + (3 - parseInt(priority)) * 5,
            due_date: dueDate // Pass due date
        });

        // Trigger Success Animation
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 1000);

        setTitle('');
        setDueDate(''); // Reset due date
        setError('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`card-cyber mb-8 relative border-cyber-neonCyan transition-all duration-300 ${successFlash ? 'shadow-[0_0_30px_#00ffff] border-white scale-[1.01]' : 'shadow-[0_0_15px_rgba(0,255,255,0.3)]'}`}
        >
            <h3 className="text-cyber-neonCyan font-bold mb-4 uppercase tracking-wider">New Directive</h3>

            {error && (
                <div className="absolute top-2 right-4 text-xs font-bold text-cyber-neonPink animate-pulse bg-black px-2 border border-cyber-neonPink shadow-[0_0_10px_#ff00ff]">
                    ⚠ {error}
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Enter task description..."
                        className={`input-cyber w-full placeholder-gray-200 border-gray-400 focus:border-cyber-neonCyan focus:shadow-[0_0_10px_#00ffff] ${error ? 'border-cyber-neonPink shadow-[0_0_10px_#ff00ff]' : ''}`}
                        maxLength={60}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <CyberSelect
                        value={category}
                        onChange={setCategory}
                        options={categories.map(cat => ({
                            value: cat.name,
                            label: `${cat.name} ${cat.is_default ? '(Default)' : ''}`
                        }))}
                        className="flex-1 min-w-[150px]"
                        neonColor="cyan"
                    />

                    <CyberSelect
                        value={priority}
                        onChange={setPriority}
                        options={[
                            { value: '1', label: 'HIGH (1)' },
                            { value: '2', label: 'MED (2)' },
                            { value: '3', label: 'LOW (3)' }
                        ]}
                        className="w-36 flex-none"
                        neonColor="cyan"
                    />

                    <CyberDateInput
                        value={dueDate}
                        onChange={setDueDate}
                        placeholder="Due Date"
                    />

                    <button type="submit" className="btn-cyber btn-neon-cyan flex-none w-full sm:w-auto ml-auto">
                        INITIALIZE
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TaskForm;

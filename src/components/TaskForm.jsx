import React, { useState, useEffect } from 'react';

const TaskForm = ({ onAddTask, categoryRefreshTrigger }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('2');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, [categoryRefreshTrigger]);

    const fetchCategories = () => {
        fetch('api/categories.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Sort: Default first, then alphabetical
                    const sorted = data.sort((a, b) => {
                        if (a.is_default === b.is_default) return a.name.localeCompare(b.name);
                        return a.is_default ? -1 : 1;
                    });

                    setCategories(sorted);

                    // Auto-select default or first available if no selection
                    const defaultCat = sorted.find(c => c.is_default);
                    if (defaultCat) {
                        setCategory(defaultCat.name);
                    } else if (sorted.length > 0) {
                        setCategory(sorted[0].name);
                    }
                } else {
                    console.error("Categories data is not an array:", data);
                    setCategories([]);
                }
            })
            .catch(err => console.error("Failed to load categories", err));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

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
            points_value: 10 + (3 - parseInt(priority)) * 5
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

                <div className="flex flex-wrap gap-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-cyber flex-1 min-w-[120px]"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name} {cat.is_default ? '(Default)' : ''}
                            </option>
                        ))}
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="input-cyber w-32 flex-none"
                    >
                        <option value="1">High (1)</option>
                        <option value="2">Med (2)</option>
                        <option value="3">Low (3)</option>
                    </select>

                    <button type="submit" className="btn-cyber btn-neon-cyan flex-none w-full sm:w-auto">
                        INITIALIZE
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TaskForm;

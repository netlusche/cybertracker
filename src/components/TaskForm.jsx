import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CyberSelect from './CyberSelect';
import CyberDateInput from './CyberDateInput';

const TaskForm = ({ onAddTask, categoryRefreshTrigger, categories = [] }) => {
    const { t } = useTranslation();
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
            setError(t('tasks.placeholder')); // Using placeholder as error for now or add specific key
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
            <h3 className="text-cyber-neonCyan font-bold mb-4 uppercase tracking-wider">{t('tasks.new_directive')}</h3>

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
                        placeholder={t('tasks.placeholder')}
                        className={`input-cyber w-full placeholder-gray-200 border-gray-400 focus:border-cyber-neonCyan focus:shadow-[0_0_10px_#00ffff] ${error ? 'border-cyber-neonPink shadow-[0_0_10px_#ff00ff]' : ''}`}
                        onFocus={(e) => e.target.select()}
                        maxLength={60}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <CyberSelect
                        value={category}
                        onChange={setCategory}
                        options={categories.map(cat => ({
                            value: cat.name,
                            label: `${cat.name} ${cat.is_default ? t('tasks.default_suffix') : ''}`
                        }))}
                        className="flex-1 min-w-[150px]"
                        neonColor="cyan"
                    />

                    <CyberSelect
                        value={priority}
                        onChange={setPriority}
                        options={[
                            { value: '1', label: `${t('common.high')} (1)` },
                            { value: '2', label: `${t('common.med')} (2)` },
                            { value: '3', label: `${t('common.low')} (3)` }
                        ]}
                        className="w-36 flex-none"
                        neonColor="cyan"
                    />

                    <CyberDateInput
                        value={dueDate}
                        onChange={setDueDate}
                        placeholder={t('tasks.due_date')}
                    />

                    <button type="submit" className="btn-cyber btn-neon-cyan flex-none w-full sm:w-auto ml-auto">
                        {t('tasks.add')}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TaskForm;

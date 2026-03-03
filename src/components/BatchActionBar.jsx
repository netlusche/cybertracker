import React from 'react';
import { useTranslation } from 'react-i18next';

const BatchActionBar = ({ selectedCount, onCompleteAll, onDeleteAll, onClearSelection }) => {
    const { t } = useTranslation();

    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-black/95 border-t-2 border-cyber-primary backdrop-blur-md animate-slide-up" style={{ boxShadow: '0 -5px 30px rgba(0,0,0,0.8), 0 -2px 10px var(--theme-primary)' }}>
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-lg md:text-xl font-bold uppercase tracking-widest animate-pulse text-[#f3f4f6]" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                        [ {t('tasks.batch_actions.selected', { count: selectedCount, defaultValue: `${selectedCount} DIRECTIVE(S) SELECTED` })} ]
                    </span>
                    <button
                        onClick={onClearSelection}
                        className="text-sm uppercase underline decoration-dashed transition-colors text-[#e5e7eb] hover:text-[#ffffff]"
                    >
                        {t('tasks.batch_actions.clear_selection', { defaultValue: 'CLEAR SELECTION' })}
                    </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={onCompleteAll}
                        className="flex-1 md:flex-none bg-transparent border-2 border-cyber-success text-cyber-success hover:bg-cyber-success hover:text-black font-bold uppercase tracking-widest px-4 py-2 transition-all hover:scale-105"
                        style={{ boxShadow: '0 0 10px var(--theme-success)' }}
                        data-tooltip-content={t('tasks.batch_actions.complete_all_tooltip', { defaultValue: 'Mark all selected directives as COMPLETE' })}
                    >
                        {t('tasks.batch_actions.complete_all', { defaultValue: 'COMPLETE ALL' })}
                    </button>
                    <button
                        onClick={onDeleteAll}
                        className="flex-1 md:flex-none bg-transparent border-2 border-cyber-danger text-cyber-danger hover:bg-cyber-danger hover:text-white font-bold uppercase tracking-widest px-4 py-2 transition-all hover:scale-105"
                        style={{ boxShadow: '0 0 10px var(--theme-danger)' }}
                        data-tooltip-content={t('tasks.batch_actions.delete_all_tooltip', { defaultValue: 'Permanently DELETE all selected directives' })}
                    >
                        {t('tasks.batch_actions.delete_all', { defaultValue: 'DELETE ALL' })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchActionBar;

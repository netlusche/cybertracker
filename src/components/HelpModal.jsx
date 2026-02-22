import React from 'react';
import { useTranslation } from 'react-i18next';
import { triggerNeonConfetti } from '../utils/confetti';
import { useTheme } from '../utils/ThemeContext';

const HelpModal = ({ onClose }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const handleAcknowledge = () => {
        triggerNeonConfetti(theme);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="card-cyber text-white max-w-2xl w-full max-h-[90vh] flex flex-col p-1 overflow-hidden border-cyber-primary shadow-cyber-primary relative">
                <button
                    onClick={onClose}
                    className={`absolute font-bold text-xl transition-colors z-50 ${theme === 'lcars' ? 'top-0 right-0 bg-[#ffaa00] text-black px-3 py-1 rounded-tr-[1.5rem] hover:brightness-110' : `top-1 ${(theme === 'matrix' || theme === 'weyland' || theme === 'cyberpunk') ? 'right-6' : 'right-1'} text-cyber-secondary hover:text-white`}`}
                >
                    [X]
                </button>
                <div className="overflow-y-auto custom-scrollbar flex-1 relative p-6 pr-8">

                    <h2 className="text-2xl font-bold mb-6 text-cyber-primary border-b border-cyber-gray pb-2 uppercase tracking-widest pt-2">
                        {t('help.title')}
                    </h2>

                    <div className="space-y-6 font-mono text-sm">
                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.neural_progression.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.neural_progression.item1_label')}:</strong> {t('help.sections.neural_progression.item1_text')}</li>
                                <li><strong>{t('help.sections.neural_progression.item2_label')}:</strong> {t('help.sections.neural_progression.item2_text')}</li>
                                <li><strong>{t('help.sections.neural_progression.item3_label')}:</strong> {t('help.sections.neural_progression.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.system_access.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.system_access.item1_label')}:</strong> {t('help.sections.system_access.item1_text1')} <span className="text-yellow-500">{t('help.sections.system_access.item1_warn')}</span></li>
                                <li><strong>{t('help.sections.system_access.item2_label')}:</strong> {t('help.sections.system_access.item2_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.bio_lock.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li>{t('help.sections.bio_lock.item1')}</li>
                                <li>{t('help.sections.bio_lock.item2')}</li>
                                <li>{t('help.sections.bio_lock.item3')}</li>
                                <li><span className="text-cyber-secondary">{t('help.sections.bio_lock.item4_warn')}</span> {t('help.sections.bio_lock.item4_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.directive_execution.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.directive_execution.item1_label')}:</strong> {t('help.sections.directive_execution.item1_text')}</li>
                                <li><strong>{t('help.sections.directive_execution.item2_label')}:</strong> {t('help.sections.directive_execution.item2_text')}</li>
                                <li><strong>{t('help.sections.directive_execution.item3_label')}:</strong> {t('help.sections.directive_execution.item3_text')}</li>
                                <li><strong>{t('help.sections.directive_execution.item4_label')}:</strong> {t('help.sections.directive_execution.item4_text')}</li>
                                <li><strong>{t('help.sections.directive_execution.item5_label')}:</strong> {t('help.sections.directive_execution.item5_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.deep_directives.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.deep_directives.item1_label')}:</strong> {t('help.sections.deep_directives.item1_text')}</li>
                                <li><strong>{t('help.sections.deep_directives.item2_label')}:</strong> {t('help.sections.deep_directives.item2_text')}</li>
                                <li><strong>{t('help.sections.deep_directives.item3_label')}:</strong> {t('help.sections.deep_directives.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.sort_order.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.sort_order.item1_label')}:</strong> {t('help.sections.sort_order.item1_text')}</li>
                                <li><strong>{t('help.sections.sort_order.item2_label')}:</strong> {t('help.sections.sort_order.item2_text')}</li>
                                <li><strong>{t('help.sections.sort_order.item3_label')}:</strong> {t('help.sections.sort_order.item3_text')}</li>
                                <li><strong>{t('help.sections.sort_order.item4_label')}:</strong> {t('help.sections.sort_order.item4_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.category_protocols.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.category_protocols.item1_label')}:</strong> {t('help.sections.category_protocols.item1_text')}</li>
                                <li><strong>{t('help.sections.category_protocols.item2_label')}:</strong> {t('help.sections.category_protocols.item2_text')}</li>
                                <li><strong>{t('help.sections.category_protocols.item3_label')}:</strong> {t('help.sections.category_protocols.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.neural_search.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.neural_search.item1_label')}:</strong> {t('help.sections.neural_search.item1_text')}</li>
                                <li><strong>{t('help.sections.neural_search.item2_label')}:</strong> {t('help.sections.neural_search.item2_text')}</li>
                                <li><strong>{t('help.sections.neural_search.item3_label')}:</strong> {t('help.sections.neural_search.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.chrono_sync.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.chrono_sync.item1_label')}:</strong> {t('help.sections.chrono_sync.item1_text')}</li>
                                <li><strong>{t('help.sections.chrono_sync.item2_label')}:</strong> {t('help.sections.chrono_sync.item2_text')}</li>
                                <li><strong>{t('help.sections.chrono_sync.item3_label')}:</strong> {t('help.sections.chrono_sync.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.system_resiliency.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.system_resiliency.item1_label')}:</strong> {t('help.sections.system_resiliency.item1_text')}</li>
                                <li><strong>{t('help.sections.system_resiliency.item2_label')}:</strong> {t('help.sections.system_resiliency.item2_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.multilingual_sync.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.multilingual_sync.item1_label')}:</strong> {t('help.sections.multilingual_sync.item1_text')}</li>
                                <li><strong>{t('help.sections.multilingual_sync.item2_label')}:</strong> {t('help.sections.multilingual_sync.item2_text')}</li>
                                <li><strong>{t('help.sections.multilingual_sync.item3_label')}:</strong> {t('help.sections.multilingual_sync.item3_text')}</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-cyber-success font-bold text-lg mb-2">{t('help.sections.visual_interface.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><strong>{t('help.sections.visual_interface.item1_label')}:</strong> {t('help.sections.visual_interface.item1_text')}</li>
                                <li><strong>{t('help.sections.visual_interface.item2_label')}:</strong> {t('help.sections.visual_interface.item2_text')}</li>
                                <li><strong>{t('help.sections.visual_interface.item3_label')}:</strong> {t('help.sections.visual_interface.item3_text')}</li>
                            </ul>
                            <div className="mt-4 w-5/6 mx-auto">
                                <p className="text-cyber-primary font-bold text-sm tracking-widest mb-2">{t('help.sections.visual_interface.themes_title')}</p>
                                <ul className="space-y-1.5 text-xs">
                                    {[
                                        { key: 'cyberpunk', color: '#00ffff' },
                                        { key: 'lcars', color: '#ffcc33' },
                                        { key: 'matrix', color: '#00ff41' },
                                        { key: 'weyland', color: '#ffb000' },
                                        { key: 'robco', color: '#1aff1a' },
                                        { key: 'grid', color: '#6fc3df' },
                                        { key: 'section9', color: '#34e2e2' },
                                        { key: 'outrun', color: '#ff00ff' },
                                        { key: 'steampunk', color: '#c8882a' },
                                        { key: 'force', color: '#cc4422' },
                                        { key: 'arrakis', color: '#d97706' },
                                        { key: 'renaissance', color: '#ffb000' },
                                        { key: 'klingon', color: '#ff0000' }
                                    ].map(({ key, color }) => {
                                        const full = t(`help.sections.visual_interface.theme_${key}`, '');
                                        const match = full.match(/(\s*—\s*|\s*-\s*|\s*–\s*|:\s*|——)/);
                                        const dashIdx = match ? match.index : -1;
                                        const delimLen = match ? match[0].length : 0;
                                        const label = dashIdx >= 0 ? full.slice(0, dashIdx).trim() : full;
                                        const desc = dashIdx >= 0 ? full.slice(dashIdx + delimLen).trim() : '';
                                        return (
                                            <li key={key} className="flex gap-2">
                                                <span className="font-bold shrink-0" style={{ color }}>{label}</span>
                                                {desc && <span className="text-gray-400">{desc}</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </section>


                        <section className="border-t border-cyber-gray pt-4 mt-8">
                            <h3 className="text-cyber-secondary font-bold text-lg mb-2">{t('help.sections.danger_zone.title')}</h3>
                            <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                                <li><span className="text-cyber-secondary">{t('help.sections.danger_zone.item1_warn')}</span> {t('help.sections.danger_zone.item1_text')}</li>
                                <li><strong>{t('help.sections.danger_zone.item2_label')}:</strong> {t('help.sections.danger_zone.item2_text')}</li>
                            </ul>
                        </section>
                    </div>

                    <div className="mt-8 text-center pb-4">
                        <button
                            onClick={handleAcknowledge}
                            className="border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black px-6 py-2 rounded transition-all duration-300 uppercase tracking-widest font-bold"
                        >
                            {t('help.acknowledge')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;

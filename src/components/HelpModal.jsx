import React from 'react';
import { useTranslation } from 'react-i18next';
import { triggerNeonConfetti } from '../utils/confetti';

const HelpModal = ({ onClose }) => {
    const { t } = useTranslation();
    const handleAcknowledge = () => {
        triggerNeonConfetti();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-cyber-black text-white p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyber-neonCyan shadow-[0_0_20px_rgba(0,255,255,0.3)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-cyber-neonPink hover:text-white font-bold text-xl"
                >
                    [X]
                </button>

                <h2 className="text-2xl font-bold mb-6 text-cyber-neonCyan border-b border-cyber-gray pb-2 uppercase tracking-widest">
                    {t('help.title')}
                </h2>

                <div className="space-y-6 font-mono text-sm">
                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.neural_progression.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.neural_progression.item1_label')}:</strong> {t('help.sections.neural_progression.item1_text')}</li>
                            <li><strong>{t('help.sections.neural_progression.item2_label')}:</strong> {t('help.sections.neural_progression.item2_text')}</li>
                            <li><strong>{t('help.sections.neural_progression.item3_label')}:</strong> {t('help.sections.neural_progression.item3_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.system_access.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.system_access.item1_label')}:</strong> {t('help.sections.system_access.item1_text1')} <span className="text-yellow-500">{t('help.sections.system_access.item1_warn')}</span></li>
                            <li><strong>{t('help.sections.system_access.item2_label')}:</strong> {t('help.sections.system_access.item2_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.bio_lock.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li>{t('help.sections.bio_lock.item1')}</li>
                            <li>{t('help.sections.bio_lock.item2')}</li>
                            <li>{t('help.sections.bio_lock.item3')}</li>
                            <li><span className="text-cyber-neonPink">{t('help.sections.bio_lock.item4_warn')}</span> {t('help.sections.bio_lock.item4_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.directive_execution.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.directive_execution.item1_label')}:</strong> {t('help.sections.directive_execution.item1_text')}</li>
                            <li><strong>{t('help.sections.directive_execution.item2_label')}:</strong> {t('help.sections.directive_execution.item2_text')}</li>
                            <li><strong>{t('help.sections.directive_execution.item3_label')}:</strong> {t('help.sections.directive_execution.item3_text')}</li>
                            <li><strong>{t('help.sections.directive_execution.item4_label')}:</strong> {t('help.sections.directive_execution.item4_text')}</li>
                            <li><strong>{t('help.sections.directive_execution.item5_label')}:</strong> {t('help.sections.directive_execution.item5_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.sort_order.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.sort_order.item1_label')}:</strong> {t('help.sections.sort_order.item1_text')}</li>
                            <li><strong>{t('help.sections.sort_order.item2_label')}:</strong> {t('help.sections.sort_order.item2_text')}</li>
                            <li><strong>{t('help.sections.sort_order.item3_label')}:</strong> {t('help.sections.sort_order.item3_text')}</li>
                            <li><strong>{t('help.sections.sort_order.item4_label')}:</strong> {t('help.sections.sort_order.item4_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.category_protocols.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.category_protocols.item1_label')}:</strong> {t('help.sections.category_protocols.item1_text')}</li>
                            <li><strong>{t('help.sections.category_protocols.item2_label')}:</strong> {t('help.sections.category_protocols.item2_text')}</li>
                            <li><strong>{t('help.sections.category_protocols.item3_label')}:</strong> {t('help.sections.category_protocols.item3_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.neural_search.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.neural_search.item1_label')}:</strong> {t('help.sections.neural_search.item1_text')}</li>
                            <li><strong>{t('help.sections.neural_search.item2_label')}:</strong> {t('help.sections.neural_search.item2_text')}</li>
                            <li><strong>{t('help.sections.neural_search.item3_label')}:</strong> {t('help.sections.neural_search.item3_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.chrono_sync.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.chrono_sync.item1_label')}:</strong> {t('help.sections.chrono_sync.item1_text')}</li>
                            <li><strong>{t('help.sections.chrono_sync.item2_label')}:</strong> {t('help.sections.chrono_sync.item2_text')}</li>
                            <li><strong>{t('help.sections.chrono_sync.item3_label')}:</strong> {t('help.sections.chrono_sync.item3_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.system_resiliency.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.system_resiliency.item1_label')}:</strong> {t('help.sections.system_resiliency.item1_text')}</li>
                            <li><strong>{t('help.sections.system_resiliency.item2_label')}:</strong> {t('help.sections.system_resiliency.item2_text')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">{t('help.sections.multilingual_sync.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>{t('help.sections.multilingual_sync.item1_label')}:</strong> {t('help.sections.multilingual_sync.item1_text')}</li>
                            <li><strong>{t('help.sections.multilingual_sync.item2_label')}:</strong> {t('help.sections.multilingual_sync.item2_text')}</li>
                            <li><strong>{t('help.sections.multilingual_sync.item3_label')}:</strong> {t('help.sections.multilingual_sync.item3_text')}</li>
                        </ul>
                    </section>


                    <section className="border-t border-cyber-gray pt-4 mt-8">
                        <h3 className="text-cyber-neonPink font-bold text-lg mb-2">{t('help.sections.danger_zone.title')}</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><span className="text-cyber-neonPink">{t('help.sections.danger_zone.item1_warn')}</span> {t('help.sections.danger_zone.item1_text')}</li>
                            <li><strong>{t('help.sections.danger_zone.item2_label')}:</strong> {t('help.sections.danger_zone.item2_text')}</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleAcknowledge}
                        className="border border-cyber-neonCyan text-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black px-6 py-2 rounded transition-all duration-300 uppercase tracking-widest font-bold"
                    >
                        {t('help.acknowledge')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;

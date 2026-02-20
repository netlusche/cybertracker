import React from 'react';
import { useTranslation } from 'react-i18next';

const CyberAlert = ({ message, onClose, variant = 'cyan', title }) => {
    const { t } = useTranslation();
    const displayTitle = title || t('common.system_message');
    const isPink = variant === 'pink';

    // Theme-compatible classes (using our defined CSS variables in index.css)
    const accentClass = isPink ? 'border-cyber-secondary' : 'border-cyber-primary';
    const textClass = isPink ? 'text-cyber-secondary' : 'text-cyber-primary';
    const glowClass = isPink ? 'shadow-cyber-secondary' : 'shadow-cyber-primary';
    const decorationClass = isPink ? 'bg-cyber-secondary/50' : 'bg-cyber-primary/50';
    const iconGlow = isPink ? 'shadow-cyber-secondary' : 'shadow-cyber-primary';
    const buttonClass = isPink ? 'btn-cyber-secondary' : 'btn-cyber-primary';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-cyber-black p-8 max-w-md w-full border-2 ${accentClass} ${glowClass} relative overflow-hidden`}>
                {/* Glitch Effect Ornaments */}
                <div className={`absolute top-0 left-0 w-full h-1 ${decorationClass} animate-pulse`}></div>
                <div className={`absolute bottom-0 right-0 w-1/2 h-1 ${decorationClass}`}></div>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className={`w-16 h-16 border-2 ${accentClass} flex items-center justify-center rounded-sm`}>
                        <span className={`text-3xl ${textClass} ${iconGlow}`}>i</span>
                    </div>

                    <h2 className={`text-xl font-black ${textClass} uppercase tracking-[0.2em]`}>
                        {displayTitle}
                    </h2>

                    <div className={`font-mono text-gray-300 text-sm leading-relaxed border-l-2 ${accentClass} pl-4 py-2 bg-white/5 uppercase text-left w-full`}>
                        {message}
                    </div>

                    <div className="w-full pt-4">
                        <button
                            onClick={onClose}
                            className={`w-full py-3 ${buttonClass} text-black font-black uppercase text-xs tracking-[0.2em] transform transition-all duration-300 hover:scale-[1.02] active:scale-95 active:brightness-75`}
                        >
                            {t('common.acknowledge')}
                        </button>
                    </div>
                </div>

                {/* Background ID Tag */}
                <div className="absolute -bottom-2 -right-2 text-[60px] font-black text-white/5 pointer-events-none select-none italic uppercase">
                    Alert
                </div>
            </div>
        </div>
    );
};

export default CyberAlert;

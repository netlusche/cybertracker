import React from 'react';
import { useTranslation } from 'react-i18next';

const CyberConfirm = ({ message, onConfirm, onCancel, variant = 'cyan', title }) => {
    const { t } = useTranslation();
    const displayTitle = title || t('common.attention');
    const isPink = variant === 'pink';
    const accentClass = isPink ? 'border-cyber-neonPink' : 'border-cyber-neonCyan';
    const textClass = isPink ? 'text-cyber-neonPink' : 'text-cyber-neonCyan';
    const glowClass = isPink ? 'shadow-[0_0_30px_rgba(255,0,255,0.2)]' : 'shadow-[0_0_30px_rgba(0,255,255,0.2)]';
    const decorationClass = isPink ? 'bg-cyber-neonPink/50' : 'bg-cyber-neonCyan/50';
    const iconGlow = isPink ? 'shadow-[0_0_10px_#f0f]' : 'shadow-[0_0_10px_#0ff]';
    const buttonClass = isPink ? 'bg-cyber-neonPink shadow-[0_0_20px_#f0f]' : 'bg-cyber-neonCyan shadow-[0_0_20px_#0ff]';

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-cyber-black p-8 max-w-md w-full border-2 ${accentClass} ${glowClass} relative overflow-hidden group`}>
                {/* Glitch Effect Ornaments */}
                <div className={`absolute top-0 left-0 w-full h-1 ${decorationClass} animate-pulse`}></div>
                <div className={`absolute bottom-0 right-0 w-1/2 h-1 ${decorationClass}`}></div>

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className={`w-16 h-16 border-2 ${accentClass} flex items-center justify-center rounded-sm animate-bounce`}>
                        <span className={`text-3xl ${textClass} ${iconGlow}`}>⚠</span>
                    </div>

                    <h2 className={`text-xl font-black ${textClass} uppercase tracking-[0.2em]`}>
                        {displayTitle}
                    </h2>

                    <p className={`font-mono text-gray-300 text-sm leading-relaxed border-l-2 ${accentClass} pl-4 py-2 bg-white/5 uppercase`}>
                        {message || t('tasks.priority_confirm')}
                    </p>

                    <div className="flex gap-4 w-full pt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all duration-300 uppercase font-black text-xs tracking-widest active:scale-95"
                        >
                            [ {t('common.abort')} ]
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 ${buttonClass} text-black font-black uppercase text-xs tracking-[0.2em] transform transition-all duration-300 hover:scale-105 active:scale-95 active:brightness-75`}
                        >
                            {t('common.jack_in')}
                        </button>
                    </div>
                </div>

                {/* Background ID Tag */}
                <div className="absolute -bottom-2 -right-2 text-[60px] font-black text-white/5 pointer-events-none select-none italic">
                    CONFIRM
                </div>
            </div>
        </div>
    );
};

export default CyberConfirm;

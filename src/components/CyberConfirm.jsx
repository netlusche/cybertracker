import React from 'react';
import { useTranslation } from 'react-i18next';
import SystemModal from './ui/SystemModal';
import CyberButton from './ui/CyberButton';

const CyberConfirm = ({ message, onConfirm, onCancel, variant = 'primary', title }) => {
    const { t } = useTranslation();
    const displayTitle = title || t('common.attention');

    return (
        <SystemModal
            isOpen={true}
            onClose={onCancel}
            title={displayTitle}
            variant={variant}
            hideCloseBtn={true}
            className="animate-pulse-slow"
        >
            <div className="flex flex-col items-center text-center space-y-6 mt-4">
                <div className={`w-16 h-16 border-2 flex items-center justify-center rounded-sm animate-bounce 
                    ${variant === 'warning' ? 'border-cyber-warning text-yellow-500 shadow-cyber-warning' :
                        variant === 'danger' ? 'border-cyber-danger text-cyber-danger shadow-cyber-danger' :
                            'border-cyber-primary text-cyber-primary shadow-cyber-primary'}`}>
                    <span className="text-3xl">⚠</span>
                </div>

                <p className={`font-mono text-gray-300 text-sm leading-relaxed border-l-2 pl-4 py-2 bg-white/5 uppercase
                    ${variant === 'warning' ? 'border-cyber-warning' :
                        variant === 'danger' ? 'border-cyber-danger' :
                            'border-cyber-primary'}`}>
                    {message || t('tasks.priority_confirm')}
                </p>

                <div className="flex gap-4 w-full pt-4">
                    <CyberButton variant="ghost" className="flex-1" onClick={onCancel}>
                        [ {t('common.abort')} ]
                    </CyberButton>
                    <CyberButton data-testid="confirm-button" variant={variant} className="flex-1" onClick={onConfirm}>
                        {t('common.jack_in')}
                    </CyberButton>
                </div>
            </div>

            <div className="absolute -bottom-2 -right-2 text-[60px] font-black text-white/5 pointer-events-none select-none italic z-[-1]">
                CONFIRM
            </div>
        </SystemModal>
    );
};

export default CyberConfirm;

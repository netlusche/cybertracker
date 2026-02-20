import React from 'react';

const SystemModal = ({
    isOpen,
    onClose,
    title,
    children,
    variant = 'primary',
    maxWidth = 'max-w-md',
    hideCloseBtn = false,
    className = '',
    closeBtnClassName = ''
}) => {
    if (!isOpen) return null;

    const accentClass = variant === 'warning' ? 'border-cyber-warning shadow-[0_0_20px_rgba(255,170,0,0.3)] text-yellow-500'
        : variant === 'danger' ? 'border-cyber-danger shadow-[0_0_20px_rgba(255,0,0,0.3)] text-cyber-danger'
            : 'border-cyber-primary shadow-[0_0_20px_rgba(0,255,255,0.3)] text-cyber-primary';

    const borderColor = variant === 'warning' ? 'border-cyber-warning'
        : variant === 'danger' ? 'border-cyber-danger'
            : 'border-cyber-primary';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4 font-mono animate-in fade-in duration-300">
            <div className={`bg-cyber-black p-6 ${maxWidth} w-full border-2 ${accentClass.split(' ')[0]} ${accentClass.split(' ')[1]} relative overflow-hidden flex flex-col max-h-[90vh] ${className}`}>

                {/* Header */}
                <div className={`flex justify-between items-center border-b ${borderColor}/30 pb-3 mb-4 shrink-0`}>
                    <h2 data-testid="modal-title" className={`text-xl font-bold tracking-widest uppercase ${accentClass.split(' ')[2]} flex items-center gap-2`}>
                        {title}
                    </h2>
                    {!hideCloseBtn && onClose && (
                        <button
                            onClick={onClose}
                            className={`text-2xl hover:text-white bg-transparent outline-none transition-colors border-none p-0 flex items-center justify-center focus:outline-none ${accentClass.split(' ')[2]} ${closeBtnClassName}`}
                        >
                            [X]
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1 relative pr-2">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default SystemModal;

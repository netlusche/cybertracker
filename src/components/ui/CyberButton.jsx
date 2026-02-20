import React from 'react';

const CyberButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button',
    fullWidth = false,
    ...props
}) => {
    const baseClasses = "relative overflow-hidden font-mono uppercase tracking-widest transition-all duration-300 font-bold " + (fullWidth ? "w-full " : "");

    let variantClasses = "";

    switch (variant) {
        case 'primary':
            variantClasses = "bg-cyber-primary/10 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black shadow-[0_0_10px_rgba(0,255,255,0.1)] hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]";
            break;
        case 'secondary':
            variantClasses = "bg-cyber-secondary/10 border border-cyber-secondary text-cyber-secondary hover:bg-cyber-secondary hover:text-black shadow-[0_0_10px_rgba(255,0,255,0.1)] hover:shadow-[0_0_15px_rgba(255,0,255,0.4)]";
            break;
        case 'danger':
            variantClasses = "bg-cyber-danger/10 border border-cyber-danger text-cyber-danger hover:bg-cyber-danger hover:text-white shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]";
            break;
        case 'warning':
            variantClasses = "bg-cyber-warning/10 border border-cyber-warning text-yellow-500 hover:bg-yellow-500 hover:text-black shadow-[0_0_10px_rgba(255,170,0,0.1)] hover:shadow-[0_0_15px_rgba(255,170,0,0.4)]";
            break;
        case 'info':
            variantClasses = "bg-blue-900/10 border border-blue-900 text-blue-500 hover:bg-blue-900 hover:text-white";
            break;
        case 'ghost':
            variantClasses = "border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white";
            break;
        default:
            variantClasses = "border border-cyber-primary text-cyber-primary hover:bg-cyber-primary/20";
    }

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed pointer-events-none grayscale" : "hover:scale-[1.02] active:scale-[0.98]";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 ${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </button>
    );
};

export default CyberButton;

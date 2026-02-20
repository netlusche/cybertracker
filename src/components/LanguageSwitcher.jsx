import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const portalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideContainer = containerRef.current && containerRef.current.contains(event.target);
            const isInsidePortal = portalRef.current && portalRef.current.contains(event.target);

            if (!isInsideContainer && !isInsidePortal) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'de', label: 'DE', fullName: 'Deutsch' },
        { code: 'en', label: 'EN', fullName: 'English' },
        { code: 'nl', label: 'NL', fullName: 'Nederlands' },
        { code: 'es', label: 'ES', fullName: 'Español' },
        { code: 'it', label: 'IT', fullName: 'Italiano' },
        { code: 'fr', label: 'FR', fullName: 'Français' }
    ];

    // Fallback to 'de' if code is not found
    const currentLang = languages.find(l => l.code === i18n.language) || languages.find(l => l.code === 'de');

    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const overlayWidth = 128; // w-32 is 8rem = 128px
            const padding = 16;

            // Try to align to the right of the trigger by default
            let left = rect.right + window.scrollX - overlayWidth;

            // Ensure it doesn't go off the left edge
            left = Math.max(padding, left);

            // Ensure it doesn't go off the right edge (important for mobile/small screens)
            if (left + overlayWidth > window.innerWidth - padding) {
                left = window.innerWidth - overlayWidth - padding;
            }

            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: left
            });
        }
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`text-[10px] md:text-xs px-2 py-1 transition-all font-bold border rounded uppercase tracking-widest flex items-center gap-2 group btn-lang-yellow ${isOpen
                    ? 'bg-cyber-neonPink border-cyber-neonPink text-black shadow-[0_0_10px_#ff00ff] language-active'
                    : 'border-cyber-gray text-cyber-neonCyan hover:border-cyber-neonCyan hover:shadow-[0_0_5px_#00ffff]'
                    }`}
            >
                <span className={isOpen ? '' : 'group-hover:animate-pulse'}>{currentLang?.label || '??'}</span>
                <span className={`text-[8px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Overlay */}
            {isOpen && createPortal(
                <div
                    ref={portalRef}
                    style={{ top: coords.top, left: coords.left }}
                    className="fixed z-[10000] w-32 bg-cyber-black/90 border border-cyber-neonCyan p-1 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-in fade-in zoom-in-95 duration-200 lang-dropdown-layer"
                >
                    <div className="flex flex-col gap-1">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`relative text-[10px] md:text-xs px-3 py-2 text-left transition-all font-bold uppercase tracking-widest hover:bg-cyber-neonCyan hover:text-black flex items-center justify-between group/item ${i18n.language === lang.code ? 'text-cyber-neonCyan active-lang' : 'text-gray-400'
                                    }`}
                            >
                                <span className="relative z-10">{lang.fullName}</span>
                                {i18n.language === lang.code && <span className="relative z-10 text-[8px]">●</span>}
                                <div className="absolute inset-0 bg-cyber-neonCyan/20 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity"></div>
                            </button>
                        ))}
                    </div>
                    {/* Decorative bits */}
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyber-neonCyan decorative-corner"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyber-neonCyan decorative-corner"></div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LanguageSwitcher;

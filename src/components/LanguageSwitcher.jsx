import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useTheme } from '../utils/ThemeContext';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const { theme } = useTheme();
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
                className={`text-[10px] md:text-xs px-2 py-1 transition-all font-bold border rounded uppercase tracking-widest flex items-center gap-2 group btn-lang-yellow ${theme === 'lcars'
                    ? `border-transparent ${isOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                    : (isOpen
                        ? 'bg-cyber-secondary border-cyber-secondary text-black shadow-cyber-secondary language-active'
                        : 'border-cyber-gray text-cyber-primary hover:border-cyber-primary hover:shadow-cyber-primary')
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
                    className={`fixed z-[10000] w-32 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 lang-dropdown-layer ${theme === 'lcars' ? 'bg-black/95 border border-gray-600 shadow-2xl p-0' : 'bg-cyber-black/90 border border-cyber-primary shadow-cyber-primary p-1'}`}
                >
                    <div className="flex flex-col gap-1">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`relative text-[10px] md:text-xs px-3 py-2 text-left transition-all font-bold uppercase tracking-widest hover:bg-cyber-primary hover:text-black flex items-center justify-between group/item ${i18n.language === lang.code ? (theme === 'lcars' ? 'text-white bg-white/10 active-lang' : 'text-cyber-primary active-lang') : 'text-gray-400'
                                    }`}
                            >
                                <span className={`relative z-10 ${theme === 'lcars' ? "font-['Antonio',_sans-serif]" : ""}`}>{lang.fullName}</span>
                                {i18n.language === lang.code && <span className="relative z-10 text-[8px]">●</span>}
                                {theme !== 'lcars' && <div className="absolute inset-0 bg-cyber-primary/20 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity"></div>}
                            </button>
                        ))}
                    </div>
                    {/* Decorative bits for Cyberpunk only */}
                    {theme !== 'lcars' && (
                        <>
                            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyber-primary decorative-corner"></div>
                            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyber-primary decorative-corner"></div>
                        </>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default LanguageSwitcher;

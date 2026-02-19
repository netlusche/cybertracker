import { describe, it, expect } from 'vitest';
import i18n from '../i18n';

describe('i18n Configuration', () => {
    it('should initialize with German as the default fallback language', () => {
        expect(i18n.options.fallbackLng).toContain('de');
    });

    it('should have translations for German and English', () => {
        expect(i18n.hasResourceBundle('de', 'translation')).toBe(true);
        expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    });

    it('should translate a header key correctly in German', () => {
        i18n.changeLanguage('de');
        expect(i18n.t('header.system_help')).toBe('SYSTEM HILFE');
    });

    it('should translate a header key correctly in English', () => {
        i18n.changeLanguage('en');
        expect(i18n.t('header.system_help')).toBe('SYSTEM HELP');
    });
});

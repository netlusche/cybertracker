import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

describe('LanguageSwitcher Component', () => {
    beforeEach(() => {
        i18n.changeLanguage('de');
    });

    it('displays the current language code (DE)', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        );
        expect(screen.getByText('DE')).toBeInTheDocument();
    });

    it('opens the overlay when clicked', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        );

        const trigger = screen.getByText('DE');
        fireEvent.click(trigger);

        // Check for full names in overlay (DE locale)
        expect(screen.getByText('Deutsch')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('changes language when an option is selected', async () => {
        const spy = vi.spyOn(i18n, 'changeLanguage');
        render(
            <I18nextProvider i18n={i18n}>
                <LanguageSwitcher />
            </I18nextProvider>
        );

        fireEvent.click(screen.getByText('DE'));
        fireEvent.click(screen.getByText('English'));

        expect(spy).toHaveBeenCalledWith('en');
        // Overlay should close (we can check if English text is gone - but it's in a portal)
        // Usually JSDOM handles portal cleanup too.
        expect(screen.queryByText('English')).not.toBeInTheDocument();
        spy.mockRestore();
    });
});

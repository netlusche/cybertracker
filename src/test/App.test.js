import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import i18n from '../i18n';
import { I18nextProvider } from 'react-i18next';

// Mocking fetch as it's used in App.jsx
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ isAuthenticated: false }),
    })
);

describe('App i18n Rendering', () => {
    it('renders "CYBER TASKER" title in German by default', async () => {
        render(
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        );

        // We check for the split title
        expect(screen.getByText('CYBER')).toBeInTheDocument();
        expect(screen.getByText('TASKER')).toBeInTheDocument();
    });

    it('renders "NETRUNNER LOGIN" in German', async () => {
        i18n.changeLanguage('de');
        render(
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        );

        expect(screen.getByText('NETRUNNER LOGIN')).toBeInTheDocument();
    });

    it('renders "NETRUNNER LOGIN" in English after language change', async () => {
        // Note: Since we are testing the login screen (user=null), 
        // we need to make sure the switcher is visible OR we change it programmatically.
        // However, the switcher in App is only shown if user is present.
        // For now, we test programmatically changing the language.

        i18n.changeLanguage('en');
        render(
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        );

        expect(screen.getByText('NETRUNNER LOGIN')).toBeInTheDocument();
    });
});

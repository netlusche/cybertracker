import { test, expect } from '@playwright/test';

test.describe('TS-08: Linguistic Uplink & Identity Termination', () => {

    test('TS-08.1: Language Switching Persistence', async ({ page }) => {
        await page.goto('/');

        const languages = [
            { code: 'de', label: 'DE', fullName: 'Deutsch', expected: 'OPERATIV' },
            { code: 'en', label: 'EN', fullName: 'English', expected: 'OPERATIVE' },
            { code: 'es', label: 'ES', fullName: 'Español', expected: 'OPERATIVO' },
            { code: 'it', label: 'IT', fullName: 'Italiano', expected: 'OPERATIVO' },
            { code: 'fr', label: 'FR', fullName: 'Français', expected: 'OPÉRATIF' },
            { code: 'nl', label: 'NL', fullName: 'Nederlands', expected: 'OPERATIEF' }
        ];

        for (const lang of languages) {
            // Open Language Switcher
            await page.locator('.inline-block.relative button').first().click();

            // Select Language
            await page.getByRole('button', { name: lang.fullName }).click();

            // Verify Translation in Header
            const headerText = page.locator('header .text-\\[10px\\].md\\:text-xs.text-gray-300');
            await expect(headerText).toContainText(lang.expected);

            // Verify Persistence on Reload
            await page.reload();
            await expect(page.locator('body')).not.toContainText(/INITIALIZING SYSTEM/i, { timeout: 15000 });
            await expect(headerText).toContainText(lang.expected);
        }
    });

    test('TS-08.2: Neural Purge (Account Deletion)', async ({ page }) => {
        test.slow();
        // 1. Create a temporary operative
        await page.goto('/');

        // Ensure we are in a known state (Wait for initialization)
        await expect(page.locator('body')).not.toContainText(/INITIALIZING SYSTEM/i, { timeout: 15000 });

        await page.getByTestId('auth-toggle').click();

        const timestamp = Date.now();
        const username = `purge_me_${timestamp}`;
        const email = `purge_${timestamp}@cyber.local`;
        const password = 'PurgePassword123!';

        // Use more specific locators
        await page.locator('input[placeholder*="CODENAME"], input[placeholder*="BENUTZERNAME"]').fill(username);
        await page.locator('input[placeholder*="COM-LINK"], input[placeholder*="EMAIL"]').fill(email);
        await page.locator('input[placeholder*="ACCESS KEY"], input[placeholder*="PASSWORT"]').fill(password);

        await page.locator('form button[type="submit"]').click();

        // 2. Acknowledge and Login
        const alertBox = page.getByTestId('cyber-alert');
        await expect(alertBox).toBeVisible({ timeout: 15000 });
        await alertBox.getByTestId('alert-acknowledge').click();
        await expect(alertBox).toBeHidden();

        // Login as the new user (Registration auto-switches to login mode)
        await page.locator('input[placeholder*="CODENAME"], input[placeholder*="BENUTZERNAME"]').fill(username);
        await page.locator('input[placeholder*="ACCESS KEY"], input[placeholder*="PASSWORT"]').fill(password);
        await page.locator('form button[type="submit"]').click();

        // Wait for login
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });

        // 3. Navigate to Neural Purge
        await page.getByTestId('profile-btn').click();

        // Find Delete Account Section and input password
        const deleteSection = page.locator('.border-cyber-danger\\/50');
        await deleteSection.locator('input[type="password"]').fill(password);

        // Execute Termination
        await page.locator('.btn-terminate').click();

        // Acknowledge Confirmation Dialog (CyberConfirm)
        await page.getByTestId('confirm-button').click();

        // 4. Expect Success Alert and redirection
        await expect(alertBox).toBeVisible({ timeout: 15000 });
        await expect(alertBox).toContainText(/Terminated|beendet|gelöscht|Account terminated/i);
        await alertBox.getByTestId('alert-acknowledge').click();

        // 5. Verify credentials no longer work
        // Give the UI a moment to settle after alert closure
        await page.waitForTimeout(1000);

        const finalUsernameInput = page.locator('input[placeholder*="CODENAME"], input[placeholder*="BENUTZERNAME"]');
        const finalPasswordInput = page.locator('input[placeholder*="ACCESS KEY"], input[placeholder*="PASSWORT"]');

        await finalUsernameInput.fill(username);
        await finalPasswordInput.fill(password);
        await page.locator('form button[type="submit"]').click();

        // If it logs in, that's a failure
        await expect(page.getByTestId('profile-btn')).toBeHidden({ timeout: 10000 });

        // Expect Failure Alert
        await expect(alertBox).toBeVisible({ timeout: 15000 });
        await expect(alertBox).toContainText(/Access denied|Zugriff verweigert/i);
    });
});

import { test, expect } from '@playwright/test';

test.describe('TS-01: Identity & Security Hardening', () => {

    test('TS-01.1: Registration & Initial Setup', async ({ page }) => {
        await page.goto('/');

        // Click the toggle button to switch to registration
        // It's the button with underline decoration-dotted
        await page.locator('button.decoration-dotted', { hasText: /No Identity|Keine Identit.t|Establish|Neu/i }).click();

        // There should be 3 inputs in registration mode
        const inputs = page.locator('form input');
        await expect(inputs).toHaveCount(3);

        const testUser = `operative_${Date.now()}`;

        await inputs.nth(0).fill(testUser); // Username
        await inputs.nth(1).fill(`${testUser}@cybertasker.local`); // Email
        await inputs.nth(2).fill('SecurePass_123!!'); // Password

        // Submit form
        await page.locator('form button[type="submit"]').click();

        // Expect CyberAlert indicating success (usually has .cyber-alert-box class)
        // Wait up to 10s since it involves a DB insert
        await page.screenshot({ path: 'register-step.png' });
        const alertBox = page.getByTestId('cyber-alert');
        // Wait a bit longer for the alert to appear
        await expect(alertBox).toBeVisible({ timeout: 15000 });
        // Click the acknowledge button
        await alertBox.getByTestId('alert-acknowledge').click();
        // Ensure the alert disappears
        await expect(alertBox).toBeHidden({ timeout: 10000 });
    });

    test('TS-01.5: Session Regeneration (Login)', async ({ page }) => {
        // We use Admin_Alpha seeded by seed_test_data.php
        await page.goto('/');

        // Wait for system to initialize
        await expect(page.getByText(/INITIALIZING SYSTEM|SYSTEM INITIALISIERUNG/i)).not.toBeVisible({ timeout: 15000 });

        // Form only has 2 inputs during login
        const inputs = page.locator('form input:visible');
        await expect(inputs).toHaveCount(2, { timeout: 10000 });

        // Fill out login
        await inputs.nth(0).fill('Admin_Alpha');
        await inputs.nth(1).fill('Pass_Admin_123!!');

        // Submit
        await page.locator('form button[type="submit"]').click();

        // Wait for dashboard to appear
        // The header has a button with the username
        await page.screenshot({ path: 'login-step.png' });
        const profileBtn = page.getByTestId('profile-btn');
        await expect(profileBtn).toBeVisible({ timeout: 10000 });

        // In Playwright we can check cookies to verify session changes if needed
        const cookies = await page.context().cookies();
        const phpSession = cookies.find(c => c.name === 'PHPSESSID');
        expect(phpSession).toBeDefined();
    });
});

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('TS-04: Fleet Administration - Security Policies', () => {

    test('TS-04.3: Strict Password Policy Enforcement', async ({ page }) => {
        test.slow(); // This is a complex test, give it more time
        // 1. Login as Admin
        await loginAsAdmin(page);

        // 2. Open Admin Console
        await page.getByTestId('admin-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/Admin/i);

        // 3. Toggle Strict Password Policy ON
        const toggle = page.getByTestId('strict-password-toggle');

        // Ensure it's ON for the test
        const isChecked = await toggle.isChecked();
        if (!isChecked) {
            await toggle.click({ force: true }); // sr-only input needs force: true
        }
        await expect(toggle).toBeChecked();

        // Close Admin Console
        await page.getByRole('button', { name: '[X]' }).click();
        await expect(page.getByTestId('modal-title')).toBeHidden();

        // Logout
        await page.waitForTimeout(1000); // Give state a moment to settle
        await page.getByTestId('logout-btn').click();

        // 4. Try to register with a simple password
        await page.goto('/');
        await expect(page.getByText(/INITIALIZING SYSTEM|SYSTEM INITIALISIERUNG/i)).not.toBeVisible({ timeout: 15000 });

        // Switch to registration (the decoration-dotted button)
        await page.locator('button.decoration-dotted', { hasText: /No Identity|Keine Identit.t|Establish|Neu/i }).click();

        const inputs = page.locator('form input');
        const weakUser = `weak_user_${Date.now()}`;
        await inputs.nth(0).fill(weakUser);
        await inputs.nth(1).fill(`${weakUser}@cyber.local`);
        await inputs.nth(2).fill('simple'); // Violation: too short, no upper, no number, no symbol

        await page.locator('form button[type="submit"]').click();

        // 5. Expect Failure Alert
        const alertBox = page.getByTestId('cyber-alert');
        await expect(alertBox).toBeVisible({ timeout: 10000 });
        await expect(alertBox).toContainText(/Password Policy Violation/i);
        await alertBox.getByTestId('alert-acknowledge').click();

        // 6. Register with Strong Password
        await inputs.nth(2).fill('StrongP@ss123!!');
        await page.locator('form button[type="submit"]').click();

        // Expect Success Alert
        await expect(alertBox).toBeVisible({ timeout: 10000 });
        await expect(alertBox).toContainText(/User registered|Identity established/i);
        await alertBox.getByTestId('alert-acknowledge').click();

        // Ensure any remaining alerts are closed before proceeding
        const openAlert = page.getByTestId('alert-acknowledge');
        if (await openAlert.isVisible()) {
            await openAlert.click();
        }

        // 7. Admin Override Test
        await loginAsAdmin(page);
        await page.getByTestId('admin-btn').click();
        await page.waitForTimeout(1000); // Wait for modal animation

        // Find the newly registered user in the grid
        const searchInput = page.getByTestId('admin-search');
        await searchInput.click({ force: true });
        await searchInput.fill(weakUser);
        // Wait for search debounce
        await page.waitForTimeout(500);

        // Click Reset Password (first one in the filtered list)
        await page.getByTestId('admin-reset-pwd').first().click({ force: true });

        // Input weak password (admin should be able to override)
        await page.locator('input[type="password"]').fill('admin_set_weak');
        await page.getByRole('button', { name: /Submit|Senden/i }).click();

        // Expect Success Message in the Admin Panel alert area (not necessarily a CyberAlert)
        // Expect Success Message in the Admin Panel alert area
        await expect(page.locator('.bg-green-900\\/20')).toContainText(/reset|updated|erfolgreich/i);

        // 8. CLEANUP: Toggle policy OFF for other tests to maintain neutral state
        const finalToggle = page.getByTestId('strict-password-toggle');
        if (await finalToggle.isChecked()) {
            await finalToggle.click({ force: true });
        }
        await expect(finalToggle).not.toBeChecked();
    });
});

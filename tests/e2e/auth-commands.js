// tests/e2e/auth-commands.js
import { expect } from '@playwright/test';

export async function loginAsAdmin(page) {
    // Clear any potential leftover state from previous tests in the same context
    await page.context().clearCookies();
    await page.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    await page.goto('/');

    // Wait for "INITIALIZING SYSTEM..." to disappear
    await expect(page.getByText(/INITIALIZING SYSTEM|SYSTEM INITIALISIERUNG/i)).not.toBeVisible({ timeout: 15000 });

    // If profile-btn is already visible, we are already logged in (e.g. from previous test in same context)
    if (await page.getByTestId('profile-btn').isVisible()) {
        return;
    }

    const inputs = page.locator('form input:visible');
    // Wait for at least one input to be visible to ensure form is rendered
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });

    const count = await inputs.count();
    console.log(`Initial visible input count: ${count}`);

    // Ensure we are in login mode (2 inputs: username/email and password)
    if (count !== 2) {
        await page.getByTestId('auth-toggle').click();
        await expect(inputs).toHaveCount(2, { timeout: 10000 });
    }

    // Debug: take screenshot after potential toggle
    await page.screenshot({ path: 'debug-after-toggle.png' });

    const visibleInputs = page.locator('form input:visible');
    await visibleInputs.nth(0).fill('Admin_Alpha');
    await visibleInputs.nth(1).fill('Pass_Admin_123!!');
    await page.locator('form button[type="submit"]').click();

    // Wait for the button to transition out of "WORKING" state
    // We use a regex for multiple languages: WORKING, BEZIG, CHARGEMENT, CARGANDO, CARICAMENTO
    await expect(page.locator('form button[type="submit"]')).not.toHaveText(/WORKING|BEZIG|CHARGEMENT|CARGANDO|CARICAMENTO/i, { timeout: 20000 });

    // Wait for login to complete and dashboard to load
    await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 20000 });
}

export async function loginAsTestUser(page) {
    await page.context().clearCookies();
    await page.addInitScript(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    await page.goto('/');

    await expect(page.getByText(/INITIALIZING SYSTEM|SYSTEM INITIALISIERUNG/i)).not.toBeVisible({ timeout: 15000 });

    if (await page.getByTestId('profile-btn').isVisible()) {
        return;
    }

    const inputs = page.locator('form input:visible');
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });

    const count = await inputs.count();

    // Ensure we are in login mode (2 inputs)
    if (count !== 2) {
        await page.getByTestId('auth-toggle').click();
        await expect(inputs).toHaveCount(2, { timeout: 10000 });
    }

    const visibleInputs = page.locator('form input:visible');
    // Using one of the test users created by seed_test_data.php
    await visibleInputs.nth(0).fill('Test_User_001');
    await visibleInputs.nth(1).fill('Baseline_Pass_1!');
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('form button[type="submit"]')).not.toHaveText(/WORKING|BEZIG|CHARGEMENT|CARGANDO|CARICAMENTO/i, { timeout: 20000 });
    await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 20000 });
}

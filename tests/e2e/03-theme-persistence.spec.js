import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Theme Persistence Pagination', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should keep selected theme after navigating pagination', async ({ page }) => {
        // Switch to a non‑default theme (e.g., Matrix) via Profile Modal
        await page.getByTestId('profile-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/Profil/i);
        await page.getByTestId('theme-switch-matrix').click();

        // Verify theme class applied
        await expect(page.locator('body')).toHaveClass(/\btheme-matrix\b/);

        // Close profile modal
        await page.getByRole('button', { name: '[X]' }).click();
        await expect(page.getByTestId('modal-title')).not.toBeVisible();

        await page.getByTestId('admin-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/Admin/i);

        // Navigate to last page using pagination button
        const lastBtn = page.getByTestId('admin-last-page');
        await lastBtn.scrollIntoViewIfNeeded();

        // Wait for API response when clicking last
        const responsePromise = page.waitForResponse(r => r.url().includes('admin/users') && r.status() === 200);
        await lastBtn.click();
        await responsePromise;

        // Ensure pagination worked (last button becomes disabled)
        await expect(lastBtn).toBeDisabled();

        // Reload page and verify theme persisted
        await page.reload();
        await expect(page.locator('body')).toHaveClass(/\btheme-matrix\b/);
    });

    test('should prevent cross-theme CSS bleeding in Theme Selection Previews', async ({ page }) => {
        // Open Profile Modal
        await page.getByTestId('profile-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/Profil/i);

        // Click Megacorp Executive theme
        const megacorpBtn = page.getByTestId('theme-switch-megacorp-executive');
        await megacorpBtn.waitFor({ state: 'visible' });
        await megacorpBtn.scrollIntoViewIfNeeded();
        await megacorpBtn.click();

        // Verify body gets Megacorp theme
        await expect(page.locator('body')).toHaveClass(/\btheme-megacorp-executive\b/);

        // Find the Steampunk theme preview card
        const steampunkBtn = page.getByTestId('theme-switch-steampunk');
        await steampunkBtn.scrollIntoViewIfNeeded();

        // **CRITICAL REGRESSION CHECK:** 
        // 1. Verify Steampunk preview maintains its explicit scale-100 class (not implicitly scaling due to Megacorp selection)
        await expect(steampunkBtn).toHaveClass(/scale-100/);
        // 2. Verify Steampunk preview does NOT have the active scale-102 or shadow class that belongs to Megacorp
        await expect(steampunkBtn).not.toHaveClass(/scale-\[1\.02\]/);

        // 3. Verify Megacorp is the active one
        await expect(megacorpBtn).toHaveClass(/scale-\[1\.02\]/);

        // Close Profile Modal
        await page.getByRole('button', { name: '[X]' }).click();
    });
});

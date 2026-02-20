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
});

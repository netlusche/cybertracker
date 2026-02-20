import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Directive Management Pagination', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        // Open admin panel
        await page.getByTestId('admin-btn').click();
        // Wait for Admin Panel to be visible
        await expect(page.getByTestId('modal-title')).toContainText(/Admin/i);
    });

    test('should display pagination controls and navigate pages', async ({ page }) => {
        const nextBtn = page.getByTestId('admin-next-page');
        const prevBtn = page.getByTestId('admin-previous-page');
        const firstBtn = page.getByTestId('admin-first-page');
        const lastBtn = page.getByTestId('admin-last-page');

        // Verify initial state (first page)
        await expect(firstBtn).toBeDisabled();
        await expect(prevBtn).toBeDisabled();
        await expect(nextBtn).toBeEnabled();
        await expect(lastBtn).toBeEnabled();

        // Go to next page
        const nextPromise = page.waitForResponse(r => r.url().includes('admin/users') && r.status() === 200);
        await nextBtn.click();
        await nextPromise;
        await expect(page.getByTestId('admin-first-page')).toBeEnabled();
        await expect(page.getByTestId('admin-previous-page')).toBeEnabled();

        // Jump to last page
        const lastPromise = page.waitForResponse(r => r.url().includes('admin/users') && r.status() === 200);
        await lastBtn.click();
        await lastPromise;
        await expect(nextBtn).toBeDisabled();
        await expect(lastBtn).toBeDisabled();
    });
});

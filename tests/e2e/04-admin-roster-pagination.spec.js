import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Admin Roster Pagination', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        // Open admin panel
        await page.getByTestId('admin-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/Admin/i);
    });

    test('should navigate through admin roster pages and keep data consistent', async ({ page }) => {
        const firstBtn = page.getByTestId('admin-first-page');
        const nextBtn = page.getByTestId('admin-next-page');
        const lastBtn = page.getByTestId('admin-last-page');

        // Verify initial state
        await expect(firstBtn).toBeDisabled();
        await expect(nextBtn).toBeEnabled();

        // Jump to last page
        const responsePromise = page.waitForResponse(r => r.url().includes('admin/users') && r.status() === 200);
        await lastBtn.click();
        await responsePromise;

        await expect(nextBtn).toBeDisabled();
        await expect(lastBtn).toBeDisabled();

        // Verify a user row exists on last page
        const lastUserRow = page.locator('tr[data-testid^="datagrid-row-"]').last();
        await expect(lastUserRow).toBeVisible();
        await expect(lastUserRow.locator('td').nth(1)).not.toBeEmpty();
    });
});

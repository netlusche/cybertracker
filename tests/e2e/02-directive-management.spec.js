import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Directive Management Pagination', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('should display dashboard pagination controls and navigate pages', async ({ page }) => {
        // Admin has 56 tasks now. Chunk size is 25. That means 3 pages total.
        const nextBtn = page.getByTestId('next-page');
        const prevBtn = page.getByTestId('previous-page');
        const firstBtn = page.getByTestId('first-page');
        const lastBtn = page.getByTestId('last-page');

        // Verify initial state (first page)
        await expect(firstBtn).toBeDisabled();
        await expect(prevBtn).toBeDisabled();
        await expect(nextBtn).toBeEnabled();
        await expect(lastBtn).toBeEnabled();

        // Go to next page (Page 2)
        const nextPromise = page.waitForResponse(r => r.url().includes('page=2') && r.status() === 200);
        await nextBtn.click();
        await nextPromise;
        // Verify page 2 UI state
        await expect(firstBtn).toBeEnabled();
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();
        await expect(lastBtn).toBeEnabled();

        // Jump to last page (Page 3)
        const lastPromise = page.waitForResponse(r => r.url().includes('page=3') && r.status() === 200);
        await lastBtn.click();
        await lastPromise;
        await expect(nextBtn).toBeDisabled();
        await expect(lastBtn).toBeDisabled();
    });
});

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Dashboard Sorting Rules', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('should strictly prioritize Overdue tasks above High Priority Future tasks', async ({ page }) => {
        // We will create two tasks to test precise sorting logic:
        // 1. A High Priority task due in the future
        // 2. A Low Priority task that is overdue
        const timestamp = Date.now();
        const futureHighPrioTitle = `Future High Prio ${timestamp}`;
        const overdueLowPrioTitle = `Overdue Low Prio ${timestamp}`;

        // Create Future High Priority Task
        const directiveInput = page.getByPlaceholder('Enter directive...');
        await directiveInput.fill(futureHighPrioTitle);

        // Open priority select
        await page.locator('form.card-cyber div[role="button"]').filter({ hasText: '(2)' }).click();
        await page.getByRole('listbox').locator('li').filter({ hasText: 'HIGH' }).click();

        // Open calendar and select a date in next month (future)
        await page.locator('.input-cyber', { hasText: 'DUE DATE' }).first().click();
        await page.locator('.calendar-container button').filter({ hasText: '>' }).last().click();
        await page.locator('.calendar-container .cursor-pointer.text-sm').first().click();

        await page.getByRole('button', { name: /Add/i }).click();

        // Wait for creation
        await expect(page.locator('.card-cyber').filter({ hasText: futureHighPrioTitle })).toBeVisible({ timeout: 10000 });
        await expect(directiveInput).toHaveValue('');

        // Create Overdue Low Priority Task
        await directiveInput.fill(overdueLowPrioTitle);

        // Open priority select
        await page.locator('form.card-cyber div[role="button"]').filter({ hasText: 'HIGH' }).click();
        await page.getByRole('listbox').locator('li').filter({ hasText: 'LOW' }).click();

        // Open calendar and select a date in previous month (overdue)
        await page.locator('.input-cyber', { hasText: 'DUE DATE' }).first().click();
        await page.locator('.calendar-container button').filter({ hasText: '<' }).first().click();
        await page.locator('.calendar-container button').filter({ hasText: '<' }).first().click(); // click it twice to be safe
        await page.locator('.calendar-container .cursor-pointer.text-sm').first().click();

        await page.getByRole('button', { name: /Add/i }).click();

        // Wait for creation
        await expect(page.locator('.card-cyber').filter({ hasText: overdueLowPrioTitle })).toBeVisible({ timeout: 10000 });
        await expect(directiveInput).toHaveValue('');

        // Both tasks are created. Now we check the global dashboard list.
        // Get all task titles on the current page.
        const allTaskTitles = await page.locator('.card-cyber h3').allTextContents();

        const futureIndex = allTaskTitles.findIndex(t => t.includes(futureHighPrioTitle));
        const overdueIndex = allTaskTitles.findIndex(t => t.includes(overdueLowPrioTitle));

        // Ensure both are found (-1 means not found)
        expect(futureIndex).toBeGreaterThan(-1);
        expect(overdueIndex).toBeGreaterThan(-1);

        // The critical assertion: Overdue Low Prio MUST appear before Future High Prio
        expect(overdueIndex).toBeLessThan(futureIndex);

        // Clean up tasks
        // Search and delete future task
        const searchInput = page.locator('#global-search-input');
        await searchInput.fill(futureHighPrioTitle);
        await searchInput.press('Enter');
        await page.waitForTimeout(500);

        let taskCard = page.locator('.card-cyber').filter({ hasText: futureHighPrioTitle }).first();
        await taskCard.hover();
        await taskCard.locator('button[data-tooltip-content="Delete Task"], button[data-tooltip-content="Delete"]').click();
        await page.getByTestId('confirm-button').click();
        await page.waitForTimeout(500);

        // Search and delete overdue task
        await searchInput.fill(overdueLowPrioTitle);
        await searchInput.press('Enter');
        await page.waitForTimeout(500);

        taskCard = page.locator('.card-cyber').filter({ hasText: overdueLowPrioTitle }).first();
        await taskCard.hover();
        await taskCard.locator('button[data-tooltip-content="Delete Task"], button[data-tooltip-content="Delete"]').click();
        await page.getByTestId('confirm-button').click();
    });
});

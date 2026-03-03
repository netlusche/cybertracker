import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('TS-16: Batch Actions (Multi-Select Operations)', () => {

    test('TS-16.1: Mark multiple directives and complete/delete them via BatchActionBar', async ({ page }) => {
        // 1. Login
        await loginAsAdmin(page);

        // 2. Clear out tasks to have a clean environment, if possible.
        // Or simply create unique task names.
        const batchId = Date.now();
        const task1 = `Batch Task 1 - ${batchId}`;
        const task2 = `Batch Task 2 - ${batchId}`;
        const task3 = `Batch Task 3 - ${batchId}`;

        // Create 3 tasks
        const createInput = page.locator('#new-directive-input');
        await createInput.fill(task1);
        await createInput.press('Enter');
        await expect(page.locator('.card-cyber').filter({ hasText: task1 })).toBeVisible();

        await createInput.fill(task2);
        await createInput.press('Enter');
        await expect(page.locator('.card-cyber').filter({ hasText: task2 })).toBeVisible();

        await createInput.fill(task3);
        await createInput.press('Enter');
        await expect(page.locator('.card-cyber').filter({ hasText: task3 })).toBeVisible();

        // 3. Find the checkboxes by data-testid
        const card1 = page.locator('.card-cyber').filter({ hasText: task1 });
        const card1Checkbox = card1.locator('button[data-testid^="task-checkbox-"]');

        const card2 = page.locator('.card-cyber').filter({ hasText: task2 });
        const card2Checkbox = card2.locator('button[data-testid^="task-checkbox-"]');

        const card3 = page.locator('.card-cyber').filter({ hasText: task3 });
        const card3Checkbox = card3.locator('button[data-testid^="task-checkbox-"]');

        // Verify BatchActionBar is not visible
        await expect(page.getByText(/DIRECTIVE\(S\) SELECTED/)).toBeHidden();

        // Select task 1 and 2
        await card1Checkbox.click();
        await card2Checkbox.click();

        // 4. Verify BatchActionBar appears with 2 selected
        await expect(page.getByText(/2 DIRECTIVE\(S\) SELECTED/)).toBeVisible();

        // 5. Click "COMPLETE ALL"
        await page.getByRole('button', { name: /COMPLETE ALL/ }).click();

        // 6. Verify they are completed (strike-through or filtered out depending on active filters)
        // Check that BatchActionBar disappears
        await expect(page.getByText(/DIRECTIVE\(S\) SELECTED/)).toBeHidden();

        // Wait for tasks to be marked complete and filtered out or styled
        // Assuming default view shows completed tasks but styled, we expect the checkbox to be disabled or gone,
        // Actually, if status == 1, task card gets opacity-50 grayscale and checkbox is likely disabled or we can't select it? Let's assume we can filter by 'Completed'.

        // The test environment might have completed tasks visible or hidden by default, so let's use the explicit filter
        await page.getByRole('button', { name: /^COMPLETED$/i }).click();

        // Verify task1 and task2 are under completed
        await expect(card1).toBeVisible();
        await expect(card2).toBeVisible();

        // Go back to Reset filter (active only)
        await page.getByRole('button', { name: /^RESET$/i }).click();

        // 7. Select task 3
        await card3Checkbox.click();
        await expect(page.getByText(/1 DIRECTIVE\(S\) SELECTED/)).toBeVisible();

        // 8. Click "DELETE ALL"
        await page.getByRole('button', { name: /DELETE ALL/ }).click();

        // 9. Confirm deletion
        const confirmBtn = page.getByTestId('confirm-button');
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        // Wait for network/UI update
        await expect(confirmBtn).toBeHidden();

        // 10. Verify task 3 is gone and action bar is hidden
        await expect(card3).toBeHidden();
        await expect(page.getByText(/DIRECTIVE\(S\) SELECTED/)).toBeHidden();
    });
});

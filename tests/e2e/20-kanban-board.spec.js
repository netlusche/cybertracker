import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
    test.beforeEach(async ({ page }) => {
        // Create a completely clean user for this test to avoid seeded data interference
        await page.goto('/');

        const timestamp = Date.now();
        const username = `kanban_user_${timestamp}`;
        const email = `kanban_${timestamp}@cyber.local`;
        const password = 'KanbanPassword123!';

        // Register
        await page.getByTestId('auth-toggle').click();
        await page.locator('input[placeholder*="CODENAME"], input[placeholder*="BENUTZERNAME"]').fill(username);
        await page.locator('input[placeholder*="COM-LINK"], input[placeholder*="EMAIL"]').fill(email);
        await page.locator('input[placeholder*="ACCESS KEY"], input[placeholder*="PASSWORT"]').fill(password);
        await page.locator('form button[type="submit"]').click();

        // Acknowledge alert
        const alertBox = page.getByTestId('cyber-alert');
        await expect(alertBox).toBeVisible({ timeout: 15000 });
        await alertBox.getByTestId('alert-acknowledge').click();

        // Login
        await page.locator('input[placeholder*="CODENAME"], input[placeholder*="BENUTZERNAME"]').fill(username);
        await page.locator('input[placeholder*="ACCESS KEY"], input[placeholder*="PASSWORT"]').fill(password);
        await page.locator('form button[type="submit"]').click();

        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('should activate Kanban Mode and verify columns', async ({ page }) => {
        const timestamp = Date.now();
        const titles = [
            `Kanban Task 1 ${timestamp}`,
            `Kanban Task 2 ${timestamp}`
        ];

        // Create a couple of tasks
        for (let i = 0; i < titles.length; i++) {
            const dirInput = page.getByPlaceholder('Enter directive...');
            await dirInput.fill(titles[i]);
            const responsePromise = page.waitForResponse(response => response.url().includes('route=tasks') && response.request().method() === 'POST' && response.status() === 200);
            await page.getByRole('button', { name: /Add/i }).click();
            await responsePromise;
            await expect(dirInput).toHaveValue('');
            await expect(page.locator('.card-cyber').filter({ hasText: titles[i] })).toBeVisible({ timeout: 10000 });
            await page.waitForTimeout(200); // allow creation buffer
        }

        // Activate Kanban Mode
        const kanbanBtn = page.getByTestId('kanban-btn');
        await expect(kanbanBtn).toBeVisible();
        await kanbanBtn.click();

        // Verify we are in Kanban Mode (Input should be hidden, generic dashboard bits gone)
        await expect(page.getByPlaceholder('Enter directive...')).toBeHidden();

        // Verify the Kanban columns exist (at least Open and Completed)
        await expect(page.locator('h3').filter({ hasText: 'OPEN' })).toBeVisible();
        await expect(page.locator('h3').filter({ hasText: 'COMPLETED' })).toBeVisible();

        // Verify our tasks are rendered in the Open column (since they are new)
        await expect(page.locator('.card-cyber').filter({ hasText: titles[0] })).toBeVisible();
        await expect(page.locator('.card-cyber').filter({ hasText: titles[1] })).toBeVisible();

        // Verify the empty dropzone text is present in the empty columns
        await expect(page.locator('text=DROP DIRECTIVES HERE').first()).toBeVisible();

        // Exit Kanban Mode
        const exitKanbanBtn = page.getByTestId('kanban-exit-btn');
        await expect(exitKanbanBtn).toBeVisible();
        await exitKanbanBtn.click();

        // Verify regular dashboard is back
        await expect(page.getByPlaceholder('Enter directive...')).toBeVisible();
    });
});

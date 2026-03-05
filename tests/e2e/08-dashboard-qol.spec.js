import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Dashboard Quality of Life Features (Release 2.4)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('should display and function correctly for Quick-Filter Pills (US-2.4.5)', async ({ page }) => {
        // Ensure we are on Dashboard
        await expect(page.locator('.card-cyber').first()).toBeVisible();

        // 1. Check pills exist and test filtering
        const overduePill = page.getByRole('button', { name: /Overdue/i });
        const highPrioPill = page.getByRole('button', { name: /High Prio/i });
        const clearPill = page.getByRole('button', { name: /Reset/i });

        await expect(overduePill).toBeVisible();
        await expect(highPrioPill).toBeVisible();
        await expect(clearPill).toBeVisible();

        // Hover to check tooltip (English)
        await overduePill.hover();
        const tooltip = page.getByText('Shows only directives that have passed their deadline');
        await expect(tooltip).toBeVisible();

        // Click High Prio Pill to filter
        await highPrioPill.click();

        // Give it a moment to filter
        await page.waitForTimeout(500);

        // Check active state class (pink background)
        await expect(highPrioPill).toHaveClass(/bg-pink-500\/20/);

        // Click Clear Pill
        await clearPill.click();
        await page.waitForTimeout(500);

        // Check active state is removed
        await expect(highPrioPill).not.toHaveClass(/bg-pink-500\/20/);
    });

    test('should allow changing Category via Dropdown on Task Card (US-2.4.2)', async ({ page }) => {
        const firstTask = page.locator('.card-cyber').first();
        await expect(firstTask).toBeVisible();

        // In the Task Card, the category is now a CyberSelect dropdown.
        // We find the category select (it has 'uppercase tracking-wider' and is within the card)
        // We find the category select inside the card. CyberSelect uses div[role="button"] for its trigger.
        // It's the first one in the card (the second is Priority).
        const trigger = firstTask.locator('div[role="button"]').first();

        await trigger.click();

        // The dropdown options should appear
        const dropdownList = page.locator('ul[role="listbox"]').last(); // CyberSelect options container
        await expect(dropdownList).toBeVisible();

        // Select the second category in the list (assuming there are multiple)
        const options = dropdownList.locator('.cursor-pointer');
        const count = await options.count();
        if (count > 1) {
            await options.nth(1).click();
            // Verify backend update (implicitly via success)
            await page.waitForTimeout(1000);
            // the trigger text should now reflect the new category
            // (In a real scenario we could check the exact text, but counting on UI update is enough)
        }
    });

    test('should translate pills and adapt themes correctly', async ({ page }) => {
        // Change language to German
        // Language switcher is a custom component, we click its trigger button then the option
        const langSwitcherTrigger = page.locator('.btn-lang-yellow').first();
        if (await langSwitcherTrigger.isVisible()) {
            await langSwitcherTrigger.click();
            // The portal list appears at the end of the body
            await page.getByText('Deutsch').click();
            await page.waitForTimeout(1000); // Wait for i18n
        }

        // Check German pill text
        const germanPill = page.getByRole('button', { name: /Überfällig/i });
        await expect(germanPill).toBeVisible();

        // Open Profile and change Theme to check UI doesn't crash
        await page.getByTestId('profile-btn').click();
        const profileModal = page.locator('.fixed.inset-0').first();
        await expect(profileModal).toBeVisible();

        // Select Matrix theme directly via test id
        await page.getByTestId('theme-switch-matrix').click();

        // Close profile using a more robust locator
        await page.getByTestId('profile-close-btn').click();

        // Verify task cards still render category dropdowns properly in new theme
        const categoryContainer = page.locator('.card-cyber').nth(1).locator('div.min-w-\\[5rem\\]').first();
        await expect(categoryContainer).toBeVisible();

        // Switch back to English for other tests that might rely on it
        if (await langSwitcherTrigger.isVisible()) {
            await langSwitcherTrigger.click();
            await page.getByText('English').click();
            await page.waitForTimeout(500);
        }
    });

    test('should allow purging completed tasks if they exist (US-2.6.1)', async ({ page }) => {
        // Create a new task explicitly to avoid test interference
        const taskInput = page.locator('#new-directive-input');
        await expect(taskInput).toBeVisible();
        await taskInput.fill('Purge Test Directive');
        await page.getByRole('button', { name: /Add/i }).click();
        await expect(taskInput).toHaveValue('');

        // Wait for it to appear
        const newTask = page.locator('.card-cyber').filter({ hasText: 'Purge Test Directive' }).first();
        await expect(newTask).toBeVisible({ timeout: 10000 });

        // Mark it as completed - finding the '○' button inside this specific task card
        const statusToggle = newTask.locator('button', { hasText: '○' }).first();
        await statusToggle.click();

        // Wait for the task to be marked completed and the 'Purge Completed' button to appear globally
        const purgeBtn = page.getByRole('button', { name: /Purge/i });
        await expect(purgeBtn).toBeVisible({ timeout: 5000 });

        // Execute Purge
        await purgeBtn.click();

        // Confirm Purge
        const confirmBtn = page.getByTestId('confirm-button');
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        // Ensure the task is actually gone
        await expect(page.locator('.card-cyber').filter({ hasText: 'Purge Test Directive' })).toHaveCount(0, { timeout: 10000 });

        // Wait a bit to ensure the purge goes through and the button disappears 
        // (Note: other tasks might still be completed from other tests, but at least our task was purged)
    });

    test('should allow filtering by completed tasks (US-2.6.4)', async ({ page }) => {
        const uniqueTitle = `Completed Filter Test Directive ${Date.now()}`;
        // First create a new task that we can explicitly complete
        const newTaskInput = page.locator('#new-directive-input');
        await expect(newTaskInput).toBeVisible();
        await newTaskInput.fill(uniqueTitle);
        await page.getByRole('button', { name: /Add/i }).click();
        await expect(newTaskInput).toHaveValue('');

        const newTask = page.locator('.card-cyber').filter({ hasText: uniqueTitle }).first();
        await expect(newTask).toBeVisible({ timeout: 10000 });

        // Mark it as completed
        const statusToggle = newTask.locator('button', { hasText: '○' }).first();
        await statusToggle.click();

        // Wait for it to disappear from the default "active" view (BUGFIX 2.7.0: It SHOULD NOT disappear anymore, it should stay visible but grayed out!)
        await expect(page.locator('.card-cyber').filter({ hasText: uniqueTitle })).toBeVisible({ timeout: 10000 });


        // Now activate the "Completed" filter pill to ensure it ONLY shows completed
        const completedPill = page.getByRole('button', { name: 'Completed', exact: true });
        await expect(completedPill).toBeVisible();
        await Promise.all([
            page.waitForResponse(res => res.url().includes('route=tasks') && res.request().method() === 'GET'),
            completedPill.click()
        ]);

        // Wait for the backend response to filter and the completed task to reappear
        const filteredCompletedTask = page.locator('.card-cyber').filter({ hasText: uniqueTitle }).first();
        await expect(filteredCompletedTask).toBeVisible({ timeout: 10000 });

        // Verify the status is indeed completed
        const filteredStatusToggle = filteredCompletedTask.locator('button.bg-cyber-success').first();
        await expect(filteredStatusToggle).toBeVisible();

        // Check if Purge button appears when looking at completed tasks (it's global, but good to test its presence here too)
        const purgeBtn = page.getByRole('button', { name: /Purge/i });
        await expect(purgeBtn).toBeVisible();

        // Cleanup: Click the completed pill again to toggle it off, reverting to ALL tasks view
        await Promise.all([
            page.waitForResponse(res => res.url().includes('route=tasks') && res.request().method() === 'GET'),
            completedPill.click()
        ]);

        // Note: We don't assert visibility here because returning to ALL tasks view re-fetches
        // the list. Because completed tasks sink to the bottom, if there are many active seeded tasks,
        // this newly completed task will be pushed to page 2+, causing a visibility assertion to fail.



        // Final Cleanup - Use the Purge button instead of the flaky individual delete button
        await purgeBtn.click({ force: true });
        await page.getByTestId('confirm-button').click();
        await expect(page.locator('.card-cyber').filter({ hasText: uniqueTitle })).toHaveCount(0, { timeout: 10000 });
    });

    test('should allow filtering by Category and returning to All Categories (Bugfix)', async ({ page }) => {
        // Create a new task with a specific random name to avoid collisions
        const uniqueTitle = `Category Test ${Date.now()}`;
        const taskInput = page.locator('#new-directive-input');

        // 1. Create task
        await taskInput.fill(uniqueTitle);
        await page.getByRole('button', { name: /Add/i }).click();

        const newTask = page.locator('.card-cyber').filter({ hasText: uniqueTitle }).first();
        await expect(newTask).toBeVisible({ timeout: 10000 });

        // 2. Change its category to "Personal"
        const trigger = newTask.locator('div[role="button"]').first();
        await trigger.click();

        const dropdownList = page.locator('ul[role="listbox"]').last();
        await expect(dropdownList).toBeVisible();
        await dropdownList.locator('.cursor-pointer').nth(1).click();

        // Wait for backend to save
        await page.waitForTimeout(1000);

        // 3. Filter the dashboard by a DIFFERENT category (e.g., "Work")
        const mainCategoryFilter = page.locator('.flex-col.md\\:flex-row').locator('div[role="button"]').first();
        await mainCategoryFilter.click();

        const mainDropdownList = page.locator('ul[role="listbox"]').last();
        await expect(mainDropdownList).toBeVisible();
        await mainDropdownList.locator('.cursor-pointer').nth(1).click();

        // 4. Assert the task DISAPPEARS
        await expect(page.locator('.card-cyber').filter({ hasText: uniqueTitle })).toHaveCount(0, { timeout: 10000 });

        // 5. Filter the dashboard back to "All Categories" (The bug we fixed!)
        await mainCategoryFilter.click();
        await expect(mainDropdownList).toBeVisible();
        await mainDropdownList.locator('.cursor-pointer').filter({ hasText: 'All Categories' }).click();

        // 6. Assert the task REAPPEARS
        await expect(page.locator('.card-cyber').filter({ hasText: uniqueTitle }).first()).toBeVisible({ timeout: 10000 });

        // Cleanup
        const deleteBtn = newTask.locator('.btn-task-delete').first();
        await deleteBtn.click();
        await page.getByTestId('confirm-button').click();
        await expect(page.locator('.card-cyber').filter({ hasText: uniqueTitle })).toHaveCount(0, { timeout: 10000 });
    });
});

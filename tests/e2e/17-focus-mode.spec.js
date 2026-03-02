import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Focus Mode (Zen)', () => {
    test.beforeEach(async ({ page }) => {
        // Create a completely clean user for this test to avoid seeded data interference
        await page.goto('/');

        const timestamp = Date.now();
        const username = `zen_user_${timestamp}`;
        const email = `zen_${timestamp}@cyber.local`;
        const password = 'ZenPassword123!';

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

    test('should activate Focus Mode and cycle through tasks', async ({ page }) => {
        // Now we have a completely blank slate user with 0 tasks
        const timestamp = Date.now();
        const baseTitle = `Focus Task ${timestamp}`;

        const titles = [
            `${baseTitle} One`,
            `${baseTitle} Two`,
            `${baseTitle} Three`
        ];

        // Ensure we create them in order with varying priority
        for (let i = 0; i < titles.length; i++) {
            await page.getByPlaceholder('Enter directive...').fill(titles[i]);

            // Set High priority for the FIRST task created to test sorting (High Prio should be first)
            if (i === 0) {
                await page.locator('div[role="button"]').filter({ hasText: '(2)' }).click();
                await page.getByRole('listbox').locator('li').filter({ hasText: '(1)' }).click();
            }

            await page.getByPlaceholder('Enter directive...').press('Enter');
            await page.waitForTimeout(500); // allow creation
        }

        // Activate Focus Mode
        const focusBtn = page.getByTestId('focus-btn');
        await expect(focusBtn).toBeVisible();
        await focusBtn.click();

        // Verify we are in Focus Mode
        await expect(page.locator('text=FOCUS MODE ENGAGED')).toBeHidden(); // Ensure placeholder is gone
        await expect(page.locator('text=[ FOCUS MODE ACTIVE ]')).toBeVisible();

        // Since there are seeded admin tasks (which are technically overdue/high priority), 
        // our newly created tasks might not be the VERY first one. 
        // We will skip through the tasks until we find one of our test tasks.

        let foundTestTask = false;
        let p = 0;
        let testTaskTitle = "";

        // Loop max 15 times to find our newly created tasks among seeded ones
        while (p < 15 && !foundTestTask) {
            const currentTitle = await page.locator('.card-cyber h2').textContent();
            if (titles.includes(currentTitle)) {
                foundTestTask = true;
                testTaskTitle = currentTitle;
                break;
            }
            // Not ours, skip it
            await page.getByRole('button', { name: 'SKIP / NEXT' }).click();
            await page.waitForTimeout(500); // wait for animation
            p++;
        }

        expect(foundTestTask).toBeTruthy();

        // The first of OUR tasks it finds should be the High Priority one (titles[0])
        expect(testTaskTitle).toEqual(titles[0]);

        // Re-establish hero card locator for the rest of the test
        const heroCard = page.locator('.card-cyber').first();

        // Skip to the next task
        await page.getByRole('button', { name: 'SKIP / NEXT' }).click();

        // Wait for animation
        await page.waitForTimeout(500);

        // Next task should be titles[1] or titles[2]
        // Since both have same priority and due date, order is creation order (but backwards normally, so it might be Three then Two, just check it changed)
        await expect(heroCard).not.toContainText(titles[0]);

        const textAfterSkip1 = await heroCard.textContent();
        expect(textAfterSkip1.includes(titles[1]) || textAfterSkip1.includes(titles[2])).toBeTruthy();

        // Skip again
        await page.getByRole('button', { name: 'SKIP / NEXT' }).click();
        await page.waitForTimeout(500);

        const textAfterSkip2 = await heroCard.textContent();
        expect(textAfterSkip2).not.toEqual(textAfterSkip1); // It should be the other one
        expect(textAfterSkip2.includes(titles[1]) || textAfterSkip2.includes(titles[2])).toBeTruthy();

        // Skip again - should loop back to the first one (or whatever is top)
        await page.getByRole('button', { name: 'SKIP / NEXT' }).click();
        await page.waitForTimeout(500);

        // For good measure, let's complete the currently displayed task
        const currentTitle = await page.locator('h2.text-3xl').textContent();

        await page.getByRole('button', { name: 'COMPLETE' }).click();
        await page.waitForTimeout(1000); // wait for execution animation

        // Assert it moved on to a different task, or shows "ALL CAUGHT UP" if none left (we should have some left)
        const nextTitle = await page.locator('h2.text-3xl').textContent();
        expect(nextTitle !== currentTitle).toBeTruthy();

        // Exit Focus Mode
        await focusBtn.click();

        // Verify regular dashboard is back
        await expect(page.getByPlaceholder('Enter directive...')).toBeVisible();
    });
});

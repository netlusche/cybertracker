import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands.js';

test.describe('WebCal Feed (US-2.8.7)', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should allow generating and regenerating webcal link in profile', async ({ page }) => {
        // Open profile modal
        await Promise.all([
            page.waitForResponse(res => res.url().includes('calendar_token') && res.request().method() === 'GET'),
            page.click('button:has-text("PROFILE")')
        ]);
        await page.waitForTimeout(500); // React needs time to update calendar token state after the fetch
        await expect(page.locator('text=WEBCAL COMLINK')).toBeVisible();

        // Check for the Generate WebCal Link button if not generated yet, or Regenerate
        const generateBtn = page.locator('button:has-text("GENERATE WEBCAL LINK")');
        const regenerateBtn = page.locator('button:has-text("REGENERATE LINK")');

        if (await generateBtn.isVisible()) {
            await expect(generateBtn).toBeEnabled();
            await generateBtn.click();
            await expect(page.locator('text=NEW WEBCAL LINK GENERATED')).toBeVisible();
        }

        // Verify the input contains the feed URL with token
        const tokenInput = page.locator('input[readonly]');
        const url = await tokenInput.inputValue();
        expect(url).toContain('route=calendar/feed&token=');

        // Test Regeneration
        await regenerateBtn.click();

        // Confirm regeneration (Danger Zone style purple confirm modal might appear)
        await page.click('button:has-text("CONFIRM")');

        await expect(page.locator('text=NEW WEBCAL LINK GENERATED')).toBeVisible();

        await expect(tokenInput).not.toHaveValue(url, { timeout: 10000 });

        const newUrl = await tokenInput.inputValue();
        expect(newUrl).toContain('route=calendar/feed&token=');

        // Close profile
        await page.click('[data-testid="profile-close-btn"]');
    });

    test('should output valid ICS feed without exposing descriptions', async ({ request, page }) => {
        // We need an active token from the database
        // Let's create a task first to ensure the feed has data
        const uniqueId = Date.now();
        const title = `CyberSec Audit Request WebCal ${uniqueId}`;
        await page.fill('input[placeholder="Enter directive..."]', title);

        // Open calendar to set due date
        const dueDateInput = page.locator('.input-cyber', { hasText: 'DUE DATE' }).first();
        await dueDateInput.click();
        const firstActiveDay = page.locator('.calendar-container .cursor-pointer:not(.text-gray-300)').first();
        await firstActiveDay.click();
        await page.click('button:has-text("ADD"), button:has-text("TOEVOEGEN")');

        const taskCard = page.locator('.card-cyber', { hasText: title });
        await expect(taskCard).toBeVisible({ timeout: 10000 });
        await taskCard.getByRole('button', { name: /DETAILS/i }).click();

        // Let's add a description to it to make sure it's omitted
        await page.click('text=No description provided');

        const descriptionArea = page.locator('textarea[placeholder="Enter description..."]');
        await expect(descriptionArea).toBeVisible();
        await descriptionArea.fill('SECRET DESCRIPTION DATA');

        await page.locator('.relative.group').filter({ has: descriptionArea }).locator('button[data-tooltip-content="Save"]').click({ force: true });
        await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 5000 });

        await page.keyboard.press('Escape'); // close dossier

        // Open profile modal to get the URL
        await Promise.all([
            page.waitForResponse(res => res.url().includes('calendar_token') && res.request().method() === 'GET'),
            page.click('button:has-text("PROFILE")')
        ]);
        await page.waitForTimeout(500); // Wait for React state
        const generateBtn = page.locator('button:has-text("GENERATE WEBCAL LINK")');
        if (await generateBtn.isVisible()) {
            await expect(generateBtn).toBeEnabled();
            await generateBtn.click();
            await expect(page.locator('text=NEW WEBCAL LINK GENERATED')).toBeVisible();
        }

        const tokenInput = page.locator('input[readonly]');
        const webcalUrl = await tokenInput.inputValue();

        // Use Playwright request context to fetch the feed
        const response = await request.get(webcalUrl);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('text/calendar');

        const text = await response.text();

        // Assert ICS basic structure
        expect(text).toContain('BEGIN:VCALENDAR');
        expect(text).toContain('VERSION:2.0');
        expect(text).toContain('PRODID:-//CyberTasker//WebCal//EN');

        // Assert our item is there (category prefix might be present)
        expect(text).toContain('CyberSec Audit Request WebCal');

        // Assert description is NOT there
        expect(text).not.toContain('SECRET DESCRIPTION DATA');
        // Actually, we don't output DESCRIPTION at all
        expect(text).not.toContain('DESCRIPTION:');
    });
});

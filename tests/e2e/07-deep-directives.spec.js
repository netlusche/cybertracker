import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands.js';

test.describe('Deep Directives & Dossier Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Use the dev server URL
        await page.goto('http://localhost:5174/');
        await loginAsAdmin(page);
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('should create a task and update its dossier with markdown and links', async ({ page }) => {
        const taskTitle = `Deep Directive Test ${Date.now()}`;

        // 1. Create task
        await page.fill('input[placeholder*="directive"]', taskTitle);
        await page.click('button:has-text("ADD"), button:has-text("TOEVOEGEN")');

        const taskCard = page.locator('.card-cyber', { hasText: taskTitle });
        await expect(taskCard).toBeVisible({ timeout: 10000 });

        // 2. Open Dossier
        await taskCard.getByRole('button', { name: /DETAILS/i }).click();

        // Use more specific selector for the modal title to avoid strict mode violation
        const modalTitle = page.locator('div').filter({ hasText: /DIRECTIVE DOSSIER:/i }).first();
        await expect(modalTitle).toBeVisible({ timeout: 5000 });

        // 3. Enter Edit mode (Click on default description text)
        await page.click('text=No description provided');

        // 4. Add Description (Markdown) - Verify Multiline
        const description = '#Überschrift\n## SECURITY PROTOCOL\n**Level 5** clearance required. *Confidential*.';
        const textarea = page.locator('textarea');
        await expect(textarea).toBeVisible();
        await textarea.fill('First Line');
        await textarea.press('Enter');
        await textarea.type('Second Line');

        // Modal should still be in edit mode
        await expect(textarea).toBeVisible();

        await textarea.fill(description);

        // 5. Save using the checkmark button
        await page.click('button[title="Save Protocol"]', { force: true });

        // Wait for it to go back to read mode (textarea should disappear)
        await expect(textarea).not.toBeVisible({ timeout: 5000 });

        // 5a. Verify Cancel button
        await page.click('.markdown-body', { force: true }); // Click to edit again
        await textarea.fill('This should be discarded');
        await page.click('button[title="Cancel Changes"]', { force: true });
        await expect(textarea).not.toBeVisible();
        await expect(page.locator('.markdown-body')).toContainText(/Level 5/i);
        await expect(page.locator('.markdown-body')).not.toContainText(/discarded/i);

        // 6. Add Link
        await page.click('button:has-text("+ ADD UPLINK"), button:has-text("UPLINK TOEVOEGEN")');

        // Fill first link fields
        const linkLabel = page.locator('input[placeholder="Label"]');
        const linkUrl = page.locator('input[placeholder*="URL"]');

        await linkLabel.fill('Secure Uplink');
        await linkUrl.fill('https://secure.grid');

        // Save link via Enter
        await linkUrl.press('Enter');

        // Wait for link edit mode to close (input should disappear)
        await expect(linkLabel).not.toBeVisible({ timeout: 5000 });

        // 7. Verify Rendering in Read Mode
        const renderedDescription = page.locator('.markdown-body');
        await expect(renderedDescription).toBeVisible({ timeout: 5000 });

        await expect(renderedDescription.locator('h1')).toContainText(/Überschrift/i);
        await expect(renderedDescription.locator('h2')).toContainText(/SECURITY PROTOCOL/i);
        await expect(renderedDescription.locator('strong')).toContainText(/Level 5/i);
        await expect(renderedDescription.locator('em')).toContainText(/Confidential/i);

        // 8. Verify Link and Click-to-edit
        const linkItem = page.locator('.bg-black\\/30.border-l-cyber-primary').filter({ hasText: /Secure Uplink/i });
        await expect(linkItem).toBeVisible();

        // Click to edit
        await linkItem.click();
        await expect(linkLabel).toBeVisible();
        await linkLabel.fill('Updated Uplink');
        await page.click('button[title="Save"]');
        await expect(linkLabel).not.toBeVisible();
        await expect(page.locator('text=Updated Uplink')).toBeVisible();

        // 8a. Verify Deletion
        await page.hover('.bg-black\\/30.border-l-cyber-primary'); // Reveal delete button
        await page.click('button[title="Remove Uplink"]');
        await expect(page.locator('text=Updated Uplink')).not.toBeVisible();

        // 9. Persistence Check (Reload) - Re-add a link first
        await page.click('button:has-text("+ ADD UPLINK")');
        await linkLabel.fill('Persistent Link');
        await linkUrl.fill('https://persistent.link');
        await page.click('button[title="Save"]');

        await page.reload();
        await page.waitForSelector('.card-cyber');

        const taskCardAfterReload = page.locator('.card-cyber', { hasText: taskTitle });
        await taskCardAfterReload.getByRole('button', { name: /DETAILS/i }).click();

        await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.markdown-body h1')).toContainText(/Überschrift/i);
        await expect(page.locator('.markdown-body h2')).toContainText(/SECURITY PROTOCOL/i);
        await expect(page.locator('.markdown-body strong')).toContainText(/Level 5/i);
        await expect(page.locator('text=Persistent Link')).toBeVisible();
    });
});

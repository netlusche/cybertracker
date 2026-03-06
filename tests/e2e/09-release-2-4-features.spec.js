import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('Release 2.4 Features', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByTestId('profile-btn')).toBeVisible({ timeout: 15000 });
    });

    test('US-2.4.3: Global Keyboard Shortcuts (N, /, Esc)', async ({ page }) => {
        // Ensure Dashboard is loaded
        await expect(page.locator('.card-cyber').first()).toBeVisible();

        // Test 'N' shortcut
        await page.keyboard.press('n');
        await page.waitForTimeout(500); // Wait for scroll/focus
        const newDirectiveInput = page.locator('#new-directive-input');
        await expect(newDirectiveInput).toBeFocused();

        // Release focus
        await newDirectiveInput.blur();

        // Test '/' shortcut
        await page.keyboard.press('/');
        await page.waitForTimeout(500); // Wait for scroll/focus
        const searchInput = page.locator('#global-search-input');
        await expect(searchInput).toBeFocused();

        // Release focus
        await searchInput.blur();

        // Test 'Esc' shortcut to close modal
        // Open Profile Modal first
        await page.getByTestId('profile-btn').click();
        const profileModal = page.locator('.fixed.inset-0.backdrop-blur-sm').first();
        await expect(profileModal).toBeVisible();

        // Press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500); // Wait for transition

        // Ensure Profile Modal is closed
        await expect(profileModal).not.toBeVisible();
    });

    test('US-2.4.4: Duplicate Directive', async ({ page }) => {
        // Find the first task and click it to open DirectiveModal
        const firstTask = page.locator('.card-cyber').filter({ hasText: 'XP' }).first();
        await expect(firstTask).toBeVisible();

        const taskTitleElement = firstTask.locator('h3').first();
        const originalTitle = await taskTitleElement.innerText();

        // Open DirectiveModal by clicking the dossier button or the task body
        await firstTask.getByRole('button', { name: /DETAILS/i }).click();

        // Wait for DirectiveModal
        const directiveModal = page.locator('.fixed.inset-0.backdrop-blur-sm').first();
        await expect(directiveModal).toBeVisible();

        // Click Duplicate button
        const duplicateBtn = page.getByRole('button', { name: /DUPLICATE/i });
        await expect(duplicateBtn).toBeVisible();
        await duplicateBtn.click();

        // Ensure DirectiveModal closes
        await expect(directiveModal).not.toBeVisible();

        // Verify task form is focused and prefilled
        await page.waitForTimeout(500);
        const newDirectiveInput = page.locator('#new-directive-input');
        await expect(newDirectiveInput).toBeFocused();
        await expect(newDirectiveInput).toHaveValue(`${originalTitle} (Copy)`);

        // Submit the form
        const responsePromise = page.waitForResponse(response => response.url().includes('route=tasks') && response.request().method() === 'POST' && response.status() === 200);
        await page.getByRole('button', { name: /Add/i }).click();
        await responsePromise;
        await expect(newDirectiveInput).toHaveValue('');

        // Check the new task appears in the list (or trigger wait)
        await page.waitForTimeout(1000);

        // Ensure there is a task with the new title
        const duplicatedTaskTitle = page.getByText(`${originalTitle} (Copy)`).first();
        await expect(duplicatedTaskTitle).toBeVisible();
    });
    test('US-2.4.1: Sub-Routinen per Drag & Drop sortieren', async ({ page }) => {
        // Create a new fresh task for this test
        const uniqueTitle = `DragDrop Test ${Date.now()}`;
        const newDirectiveInput = page.getByPlaceholder('Enter directive...').first();
        await newDirectiveInput.fill(uniqueTitle);
        const responsePromise2 = page.waitForResponse(response => response.url().includes('route=tasks') && response.request().method() === 'POST' && response.status() === 200);
        await page.getByRole('button', { name: /Add/i }).click();
        await responsePromise2;
        await expect(newDirectiveInput).toHaveValue('');

        await page.waitForTimeout(500);

        // Search to bypass pagination and ensure task is visible
        const searchInput = page.locator('.mb-6 input[type="text"]').first();
        await searchInput.fill(uniqueTitle);
        await searchInput.press('Enter');
        await page.waitForTimeout(500);

        const firstTask = page.locator('.card-cyber', { hasText: uniqueTitle }).first();
        await expect(firstTask).toBeVisible();

        await firstTask.getByRole('button', { name: /DETAILS/i }).click();

        // Wait for DirectiveModal
        const directiveModal = page.locator('.fixed.inset-0.backdrop-blur-sm').first();
        await expect(directiveModal).toBeVisible();

        // Wait for subroutines segment to be ready
        const subroutinesHeading = page.getByText(/SUB-ROUTINE/i).first();
        await expect(subroutinesHeading).toBeVisible();

        // Add 3 sub-routines (A, B, C) string
        const subInput = directiveModal.locator('input[type="text"]').last();

        await subInput.fill('Sub A');
        await subInput.press('Enter');
        await page.waitForTimeout(500); // allow save to backend

        await subInput.fill('Sub B');
        await subInput.press('Enter');
        await page.waitForTimeout(500);

        await subInput.fill('Sub C');
        await subInput.press('Enter');
        await page.waitForTimeout(500);

        // The items are draggable, let's locate them
        const subItems = directiveModal.locator('[data-testid="subroutine-item"]');
        await expect(subItems).toHaveCount(3);

        // Assert initial order
        await expect(subItems.nth(0)).toContainText('Sub A');
        await expect(subItems.nth(1)).toContainText('Sub B');
        await expect(subItems.nth(2)).toContainText('Sub C');

        // Drag Sub C (index 2) to Top (index 0) using the keyboard (dnd-kit default bindings)
        const handleC = subItems.nth(2).locator('.cursor-grab');
        await handleC.focus();
        await page.keyboard.press('Space');
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(200);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(200);
        await page.keyboard.press('Space');

        await page.waitForTimeout(1000); // wait for drop & save

        // Verify local update
        await expect(subItems.nth(0)).toContainText('Sub C');
        await expect(subItems.nth(1)).toContainText('Sub A');
        await expect(subItems.nth(2)).toContainText('Sub B');

        // Close modal
        await page.keyboard.press('Escape');
        await expect(directiveModal).not.toBeVisible();
        await page.waitForTimeout(500); // Wait for transition

        // Reload page
        await page.reload();
        await page.waitForTimeout(500);

        // Re-apply search to bypass pagination again
        const searchInput2 = page.locator('.mb-6 input[type="text"]').first();
        await searchInput2.fill(uniqueTitle);
        await searchInput2.press('Enter');
        await page.waitForTimeout(500);

        await expect(page.locator('.card-cyber', { hasText: uniqueTitle }).first()).toBeVisible();

        // Re-open dossier
        await page.locator('.card-cyber', { hasText: uniqueTitle }).first().getByRole('button', { name: /DETAILS/i }).click();
        await expect(page.locator('.fixed.inset-0.backdrop-blur-sm').first()).toBeVisible();

        // Verify order is persisted
        const refreshedSubItems = page.locator('.fixed.inset-0.backdrop-blur-sm').first().locator('[data-testid="subroutine-item"]');
        await expect(refreshedSubItems).toHaveCount(3);
        await expect(refreshedSubItems.nth(0)).toContainText('Sub C');
    });
});

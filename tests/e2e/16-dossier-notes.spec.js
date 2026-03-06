import { test, expect } from '@playwright/test';

test.describe('US-2.8.3: Dossier Notes', () => {

    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/');

        // Wait for system to initialize (loader disappears)
        await expect(page.getByText(/INITIALIZING SYSTEM|SYSTEM INITIALISIERUNG/i)).not.toBeVisible({ timeout: 15000 });

        const inputs = page.locator('form input:visible');
        await expect(inputs).toHaveCount(2, { timeout: 10000 });

        await inputs.nth(0).fill('Admin_Alpha');
        await inputs.nth(1).fill('Pass_Admin_123!!');
        await page.locator('form button[type="submit"]').click();

        // Wait for dashboard to appear
        const profileBtn = page.getByTestId('profile-btn');
        await expect(profileBtn).toBeVisible({ timeout: 10000 });
    });

    test('Add, Edit, and Delete a Dossier Note', async ({ page }) => {
        const uniqueTaskName = `Note Test Directive ${Date.now()}`;
        const noteText = `Intelligence log entry ${Date.now()}`;
        const editedNoteText = `${noteText} - UPDATED`;

        // 1. Create a new Directive
        const newTaskInput = page.getByPlaceholder(/Enter directive|Neue Direktive/i);
        await newTaskInput.fill(uniqueTaskName);
        const responsePromise = page.waitForResponse(response => response.url().includes('route=tasks') && response.request().method() === 'POST' && response.status() === 200);
        await page.getByRole('button', { name: /Add/i }).click();
        await responsePromise;
        await expect(newTaskInput).toHaveValue('');

        // Wait for it to appear
        const taskCard = page.locator('.card-cyber').filter({ hasText: uniqueTaskName }).first();
        await expect(taskCard).toBeVisible({ timeout: 10000 });

        // 2. Open Dossier Modal
        const detailsBtn = taskCard.locator('button', { hasText: /DETAILS|DETAILS/i }).first();
        await detailsBtn.click();
        const modal = page.locator('.fixed.inset-0 .card-cyber').first();
        await expect(modal).toBeVisible({ timeout: 10000 });
        await expect(modal.getByText(/DOSSIER/i).first()).toBeVisible();

        // 3. Add a Note
        const noteInput = modal.locator('textarea[placeholder*="Transmit"]').first();
        await expect(noteInput).toBeVisible();
        await noteInput.fill(noteText);

        const addBtn = modal.locator('button', { hasText: /\+|APPEND|LOG/ }).last();
        await expect(addBtn).toBeEnabled();
        await addBtn.click();

        // Wait for transmittance to finish and the text to appear inside a div (not the textarea)
        const noteTextContainer = modal.locator('div').filter({ hasText: noteText }).last();
        await expect(noteTextContainer).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(1000); // give the UI a moment to attach the edit/delete buttons

        // Close modal to check indicator
        let closeBtn = modal.getByRole('button', { name: '[X]' });
        await closeBtn.click();
        await expect(modal).not.toBeVisible();

        // Verify indicator shows 1 note
        const noteIndicator = taskCard.locator('div.font-mono.text-cyber-primary').filter({ has: page.locator('svg') }).filter({ hasText: '1' }).first();
        await expect(noteIndicator).toBeVisible();
        await expect(noteIndicator).toContainText('1');

        // Reopen modal to continue test
        await detailsBtn.click();
        await expect(modal).toBeVisible({ timeout: 10000 });

        // 4. Edit the Note
        // Click directly on the .break-words container for that note
        const noteItem = modal.locator('div.group').filter({ hasText: noteText }).last();

        const editableText = noteItem.locator('.break-words').first();
        await editableText.click({ force: true });

        // It should become a textarea
        const editArea = modal.locator('textarea:visible').first();
        await editArea.fill(editedNoteText);

        // Click SAVE within the edit area parent
        const saveBtn = editArea.locator('xpath=..').locator('button', { hasText: /SAVE|SPEICHERN|GUARDAR/i }).first();
        await saveBtn.click();

        // Validate update and (edited) tag
        await expect(modal.getByText(editedNoteText).first()).toBeVisible({ timeout: 10000 });
        await expect(modal.getByText('(edited)').or(modal.getByText('(bearbeitet)')).first()).toBeVisible();

        // 5. Delete the Note
        const deleteBtn = noteItem.locator('button.text-red-500').first();
        await deleteBtn.click({ force: true });

        // Validate Deletion inside modal
        await expect(modal.getByText(editedNoteText)).not.toBeVisible({ timeout: 10000 });

        // Cleanup the task
        closeBtn = modal.getByRole('button', { name: '[X]' });
        await closeBtn.click();

        await expect(modal).not.toBeVisible();

        // Verify indicator is gone
        await expect(noteIndicator).not.toBeVisible();

        // Delete the Task
        await taskCard.hover();
        const delTaskBtn = taskCard.locator('.btn-task-delete').first();
        await delTaskBtn.click({ force: true });

        // CyberConfirm modal appears
        const confirmBtn = page.getByTestId('confirm-button').first();
        await expect(confirmBtn).toBeVisible({ timeout: 10000 });
        await confirmBtn.click();

        // Task should be removed
        await expect(taskCard).not.toBeVisible();
    });
});

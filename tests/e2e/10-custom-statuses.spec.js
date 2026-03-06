import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './auth-commands';

test.describe('TS-10: Custom Task Statuses', () => {

    test('TS-10.1: Add, Rename, and Select Custom Status', async ({ page }) => {
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        await loginAsAdmin(page);

        // 1. Open Profile Modal
        await page.getByTestId('profile-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/PROFILE|PROFIL/i);

        // 2. Add a new custom status
        const newStatusName = 'Q/A TEST';
        // Locate the specific input field and fill it
        await page.getByTestId('add-status-input').fill(newStatusName);

        // Click the corresponding Add button
        await page.getByTestId('add-status-btn').click();

        // Wait for the new status to appear in the list
        await expect(page.getByText(newStatusName)).toBeVisible();

        // 3. Rename the custom status
        const renamedStatusName = 'VERIFIED';
        // Find the specific status row we just added by looking for its span
        const statusRow = page.locator('div.flex.items-center.justify-between').filter({ has: page.locator('span', { hasText: newStatusName }) }).last();
        // The edit button has a pencil icon "✎" and is within the status item
        const editButton = statusRow.getByRole('button', { name: '✎' });

        // Click Edit on that specific list item
        await editButton.click({ force: true });

        // Find the input within the edit mode
        const editInput = page.getByTestId('edit-status-input');
        await editInput.fill(renamedStatusName);
        await page.getByRole('button', { name: '✓' }).click();

        // Verify it was renamed (wait for the alert or the text to change)
        await expect(page.getByText(renamedStatusName)).toBeVisible();

        // Close the Profile Modal
        // Click the 'X' button in the top right
        await page.getByTestId('profile-close-btn').click();
        await expect(page.getByTestId('modal-title')).toBeHidden();

        // 4. Create a new task to test the dropdown
        const taskTitle = `Test Task for Status Dropdown ${Date.now()}`;
        const titleInput = page.getByPlaceholder('Enter directive...');
        await titleInput.fill(taskTitle);
        const responsePromise = page.waitForResponse(response => response.url().includes('route=tasks') && response.request().method() === 'POST' && response.status() === 200);
        await page.getByRole('button', { name: /Add/i }).click();
        await responsePromise;
        await expect(titleInput).toHaveValue('');

        // Wait for task to appear
        const taskCard = page.locator('.card-cyber', { hasText: taskTitle }).first();
        await expect(taskCard).toBeVisible();

        // 5. Select the new custom status from the dropdown
        // Find the status dropdown container which uses CyberSelect (Category, Priority, Status). Status is the 3rd one.
        const dropdownTrigger = taskCard.locator('div.input-cyber').nth(2);
        await dropdownTrigger.click({ force: true });

        // Click the option in the opened popover list
        await page.locator('li', { hasText: renamedStatusName }).first().click({ force: true });

        // Verify the dropdown now shows VERIFIED
        await expect(dropdownTrigger).toContainText(renamedStatusName);

        // 6. Complete the task using the completion toggle radio button
        await taskCard.locator('button').filter({ hasText: '○' }).click();

        // Verify task is completed
        await expect(taskCard).toHaveClass(/opacity-50/); // Grayscale when done
        await expect(dropdownTrigger).toBeHidden(); // Dropdown disappears when task is completed
    });

    test('TS-10.2: Delete Custom Status', async ({ page }) => {
        await loginAsAdmin(page);

        // Open Profile Modal
        await page.getByTestId('profile-btn').click();
        await expect(page.getByTestId('modal-title')).toContainText(/PROFILE|PROFIL/i);

        const statusName = 'VERIFIED';
        // Look specifically inside the Profile Modal to avoid matching the TaskCard dropdowns from the dashboard
        const modalBody = page.locator('.card-cyber').filter({ hasText: 'PROFILE' }).first();
        const statusText = modalBody.getByText(statusName);

        // Ensure it exists from previous test
        await expect(statusText).toBeVisible();

        // Click delete (Trash icon is within an SVG inside the last button)
        // Find the specific status row we want to delete
        const statusRowToDelete = page.locator('div.flex.items-center.justify-between').filter({ has: page.locator('span', { hasText: statusName }) }).last();
        const deleteButton = statusRowToDelete.locator('button:has(svg)').last();
        await deleteButton.click({ force: true });

        // Confirm Purge
        await page.getByTestId('confirm-button').click();

        // Verify deletion
        await expect(statusText).toBeHidden();
    });
});

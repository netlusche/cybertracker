import { test, expect } from '@playwright/test';

test('debug focus mode', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'cyberadmin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log("Looking for focus button");
    await page.click('[data-testid="focus-btn"]');
    console.log("Clicked focus button. Waiting 2 seconds for crash/errors...");
    await page.waitForTimeout(2000);
});

import { test, expect } from '@playwright/test';

test('debug focus mode crash', async ({ page }) => {
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[BROWSER ERROR] ${msg.text()}`);
        }
    });

    page.on('pageerror', err => {
        console.log(`[PAGE UNCAUGHT EXCEPTION] ${err.message}`);
    });

    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'cyberadmin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log("clicking focus btn");
    await page.click('[data-testid="focus-btn"]');
    console.log("waiting for crash...");
    await page.waitForTimeout(3000);
});

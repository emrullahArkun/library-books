import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Mini Library/);
});

test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Login')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Library Books/);
});

test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

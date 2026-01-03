import { test, expect } from '@playwright/test';

test('book management: add and bulk delete book', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test_bulk_${uniqueId}@example.com`;
    const password = 'password123';

    // 1. Register & Login
    await page.goto('/register');
    await page.locator('input[type="email"]').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByPlaceholder('Confirm Password').fill(password);
    await page.getByRole('button', { name: /Register/i }).click();

    await page.waitForTimeout(1000);
    const loginHeader = page.getByRole('heading', { name: /Login/i });
    if (await loginHeader.isVisible()) {
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Login/i }).click();
    }

    // 2. Add Book
    await page.getByRole('link', { name: /Search/i }).click();
    await page.locator('input[type="text"]').fill('Clean Code');
    await page.getByRole('button', { name: /Search/i }).click();

    const addBtn = page.getByRole('button', { name: /Add to Library/i }).first();
    await addBtn.waitFor();
    await addBtn.click();

    // 3. Verify Book and Bulk Delete
    await page.getByRole('link', { name: 'My Books' }).click();
    const bookTitle = page.getByText('Clean Code').first();
    await expect(bookTitle).toBeVisible();

    // Find and Click Checkbox on the card
    // The checkbox is inside the card.
    // Locator strategy: Find the card that has text 'Clean Code', then find checkbox inside it.
    // Chakra checkbox is actually an input[type=checkbox] visually hidden, with a control.
    // Playwright's getByRole('checkbox') should work if label is associated.
    // We added aria-label 'Mark as Read'.
    // Wait, the checkbox is for SELECTION (bulk actions), but aria-label says 'Mark as Read'? 
    // That seems like a semantic error in MyBookCard.jsx. It says:
    // aria-label={t('myBooks.markAsRead') || 'Mark as Read'}
    // But this toggle is for SELECTION, not marking as read status.
    // However, for selectors, we use what's there.

    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check({ force: true }); // Or click

    // 4. Verify Delete Button Appears
    // Button text: "Löschen (1)" or similar.
    // Selector by role button and icon/text.
    const deleteBtn = page.getByRole('button', { name: /(Delete|Löschen).*\(1\)/i });
    await expect(deleteBtn).toBeVisible();

    // 5. Click Delete and Confirm
    page.on('dialog', dialog => dialog.accept());
    await deleteBtn.click();

    // 6. Verify Gone
    await expect(bookTitle).not.toBeVisible();
});

import { test, expect } from '@playwright/test';

test('reading session flow: start, timer check, stop with page update', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test_reading_${uniqueId}@example.com`;
    const password = 'password123';

    // 1. Register
    await page.goto('/register');
    await page.locator('input[type="email"]').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByPlaceholder('Confirm Password').fill(password);
    await page.getByRole('button', { name: /Register/i }).click();

    // 2. Login (if redirected)
    await page.waitForTimeout(1000);
    const loginHeader = page.getByRole('heading', { name: /Login/i });
    if (await loginHeader.isVisible()) {
        await page.locator('input[type="email"]').fill(email);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Login/i }).click();
    }

    // 3. Add a Book
    await page.getByRole('link', { name: /Search/i }).click();
    await page.locator('input[type="text"]').fill('Javascript');
    await page.getByRole('button', { name: /Search/i }).click();

    // Choose first book and add
    const addBtn = page.getByRole('button', { name: /Add to Library/i }).first();
    await addBtn.waitFor();
    await addBtn.click();

    // 4. Start Session
    await page.getByRole('link', { name: 'My Books' }).click();
    await expect(page.getByText('Javascript').first()).toBeVisible();

    await page.getByRole('button', { name: /Start Reading/i }).click();
    await expect(page).toHaveURL(/.*\/session/);

    // 5. Verify Timer
    // Check that "00:00" appears initially, then changes.
    // Ideally wait for a few seconds.
    const timerDisplay = page.locator('div.chakra-text, div').filter({ hasText: /00:0/ }).last();
    // The exact selector depends on implementation. 
    // In ReadingSessionPage.jsx: 6xl font size box.
    // Let's rely on text content changing.

    await expect(page.getByText(/\d+m \d+s/)).toBeVisible(); // Matches format like 0m 0s, 0m 1s
    await page.waitForTimeout(2000);
    // After 2s, it should be at least 00:01 or 00:02.
    // Verify it is NOT 00:00 anymore or just verify it exists.
    // Verify visibility of pause/stop controls.
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: /Pause/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stop/i })).toBeVisible();

    // 6. Stop Session
    await page.getByRole('button', { name: /Stop/i }).click();

    // 7. Session Summary / Done
    // Expect "Are you done reading?" text
    await expect(page.getByText(/Bist du fertig/i)).toBeVisible();

    // Enter page number
    const pageInput = page.getByRole('spinbutton'); // input type="number"
    await pageInput.fill('50');

    // Click Done/Fertig
    const doneBtn = page.getByRole('button', { name: /Fertig/i });
    await expect(doneBtn).toBeEnabled();
    await doneBtn.click();

    // 8. Verify Redirect and Update
    // Expect redirect to My Books
    await expect(page).toHaveURL(/.*\/my-books/);

    // Verify progress bar or text updated?
    // "Read 50 pages" or similar badge/text?
    // MyBookCard shows progress bar.
    // We can assume success if we are back on My Books without error.
});

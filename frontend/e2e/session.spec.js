import { test, expect } from '@playwright/test';

test('complete reading session flow', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `testuser${uniqueId}@example.com`;
    const password = 'password123';
    const bookTitle = `Test Book ${uniqueId}`;

    // 1. Register
    await page.goto('/register');
    // Wait for form to be visible
    await expect(page.getByRole('heading', { name: /Register|Account/i })).toBeVisible();

    // Fill registration form - proper selectors based on labels
    // Fill registration form - use placeholders which we know are distinct
    await page.getByPlaceholder('Enter your email').fill(email); // Assuming placeholder
    // Or stick to label for email if it worked? 
    // The previous run timed out on Password, implying Email worked? 
    // Trace said: "waiting for getByLabel('Password'...)" 
    // It didn't complain about Email.
    // So keep Email as is? No, let's be consistent.
    // RegisterPage line 120: placeholder={t('auth.enterEmail')}

    await page.getByLabel('Email').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByPlaceholder('Confirm Password').fill(password);
    await page.getByRole('button', { name: /Register|Sign Up/i }).click();

    // 2. Login (if not auto-logged in)
    // Check if we are redirected to Login page
    await page.waitForTimeout(1000); // Short wait for navigation
    const loginHeader = page.getByRole('heading', { name: /Login|Sign In/i });
    if (await loginHeader.isVisible()) {
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: /Login|Sign In/i }).click();
    }

    // 3. Add a Book via Search (since there is no direct "Create" button)
    await page.getByRole('link', { name: /Search|Home/i }).click(); // Go to home/search

    // Fill search
    const searchInput = page.getByRole('textbox').first();
    await searchInput.fill('Java');
    await page.getByRole('button', { name: /Search/i }).click();

    // Click on a result card to add it
    // The card has role="button". We'll click the first one that appears.
    const resultCard = page.getByRole('button', { name: /Add to Library|Java/i }).first();
    await resultCard.waitFor({ state: 'visible' });
    await resultCard.click();

    // 4. Start Session
    // Navigate to My Books
    await page.getByRole('link', { name: 'My Books', exact: true }).click();

    // Find the book card and start reading
    // Assuming the added book appears first or we search for it
    await expect(page.getByText('Java').first()).toBeVisible();

    // Find "Start Reading" button
    await page.getByRole('button', { name: /Start Reading/i }).first().click();

    // 5. Verify Session Page
    await expect(page).toHaveURL(/.*\/session/);

    // Expect Stop button to be visible (implies session active)
    // First wait for loading to finish (Spinner)
    // Chakra spinner often has this class or we can check absence of generic spinner role
    // OR just wait longer for the button
    // 6. Stop Session
    // The button text might be "Stop" or unicode "⏹" depending on translation
    await expect(page.getByRole('button', { name: /(Stop|⏹)/i })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /(Stop|⏹)/i }).click();

    // Handle potential confirmation
    const confirmButton = page.getByRole('button', { name: /Confirm|Yes/i });
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }

    // 7. Verify Session Ended
    await expect(page.getByText('00:00')).not.toBeVisible();
});

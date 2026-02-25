import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { ReadingSessionProvider } from '../../context/ReadingSessionContext';
import MyBooks from './MyBooks';
import { server } from '../../mocks/server';
import { http, HttpResponse, delay } from 'msw';
// Mock translations
import '../../i18n';

// Utility wrapper for tests
const createTestWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }) => (
        <AuthContext.Provider value={{ token: 'fake-token', user: { email: 'test@example.com' } }}>
            <ReadingSessionProvider>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        {children}
                    </MemoryRouter>
                </QueryClientProvider>
            </ReadingSessionProvider>
        </AuthContext.Provider>
    );
};

describe('MyBooks Component', () => {
    it('shows loading state initially', () => {
        render(<MyBooks />, { wrapper: createTestWrapper() });
        expect(screen.getByText(/Loading library.../i)).toBeInTheDocument();
    });

    it('renders books from API', async () => {
        render(<MyBooks />, { wrapper: createTestWrapper() });

        // Wait for Loading to finish and book to appear
        const book1Cover = await screen.findByAltText('Test Book 1');
        expect(book1Cover).toBeInTheDocument();

        const book2Cover = await screen.findByAltText('Test Book 2');
        expect(book2Cover).toBeInTheDocument();
    });

    it('optimistically updates "Mark as Read" status', async () => {
        // Override PATCH to delay response, ensuring we capture the optimistic state
        // before the refetch (with static mock data) reverts it.
        server.use(
            http.patch('/api/books/:id/status', async () => {
                await delay(200); // Wait 200ms
                return HttpResponse.json({ completed: true });
            })
        );

        const user = userEvent.setup();
        render(<MyBooks />, { wrapper: createTestWrapper() });

        // Wait for books to load
        const bookCover = await screen.findByAltText('Test Book 1');
        const bookCard = bookCover.closest('.book-card-detail');

        // Scope interactions to this specific card
        const checkbox = within(bookCard).getByLabelText(/myBooks.markAsRead/i);

        // Initial state: not checked
        expect(checkbox).not.toBeChecked();

        // Click it
        await user.click(checkbox);

        // EXPECTATION: It should be checked IMMEDIATELY (optimistic update)
        // because the request is still pending due to delay
        await waitFor(() => expect(checkbox).toBeChecked());
    });

    it('handles API errors gracefully', async () => {
        // Override the handler to return an error for this test
        server.use(
            http.get('/api/books', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        render(<MyBooks />, { wrapper: createTestWrapper() });

        // Expect error message to appear
        await waitFor(() => {
            expect(screen.getByText(/Error:/i)).toBeInTheDocument();
        });
    });

    it('renders empty state when no books exist', async () => {
        server.use(
            http.get('/api/books', () => {
                return HttpResponse.json({ content: [], totalElements: 0, totalPages: 0, number: 0 });
            })
        );
        render(<MyBooks />, { wrapper: createTestWrapper() });
        expect(await screen.findByText('myBooks.empty.line1')).toBeInTheDocument();
        expect(await screen.findByText('myBooks.empty.line2')).toBeInTheDocument();
    });

    describe('Selection & Bulk Delete', () => {
        it('toggles selection and deletes selected books', async () => {
            server.use(
                http.get('/api/books', () => {
                    return HttpResponse.json({
                        content: [{ id: 1, title: 'B1', readingProgress: 0 }],
                        totalElements: 1,
                        totalPages: 1,
                        number: 0
                    });
                })
            );
            const user = userEvent.setup();
            render(<MyBooks />, { wrapper: createTestWrapper() });

            // Wait for books
            const book1Cover = await screen.findByAltText('Test Book 1');
            const bookCard = book1Cover.closest('div[role="group"]');

            // Assuming clicking the card outer toggles selection
            const toggleWrapper = bookCard.querySelector('[style*="cursor: pointer"]');
            if (toggleWrapper) {
                await user.click(toggleWrapper);
            } else {
                await user.click(bookCard.firstChild);
            }

            // "Delete Selected" button should appear
            const delSelBtn = await screen.findByRole('button', { name: /myBooks.deleteSelectedCount/i });
            expect(delSelBtn).toBeInTheDocument();

            // Open dialog
            await user.click(delSelBtn);
            expect(await screen.findByText('myBooks.confirmDeleteSelectedTitle')).toBeInTheDocument();

            // Setup mock for delete
            server.use(
                http.delete('/api/books/bulk', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            // Confirm
            const confirmBtn = await screen.findByText('common.delete');
            await user.click(confirmBtn);

            // Dialog should close
            await waitFor(() => {
                expect(screen.queryByText('myBooks.confirmDeleteSelectedTitle')).not.toBeInTheDocument();
            });
        });

        it('supports deleting all books and canceling', async () => {
            server.use(
                http.get('/api/books', () => {
                    return HttpResponse.json({
                        content: [{ id: 1, title: 'B1', readingProgress: 0 }],
                        totalElements: 1,
                        totalPages: 1,
                        number: 0
                    });
                })
            );
            const user = userEvent.setup();
            render(<MyBooks />, { wrapper: createTestWrapper() });

            await screen.findByAltText('Test Book 1');

            const delAllBtn = await screen.findByText('myBooks.deleteAll');
            await user.click(delAllBtn);

            expect(await screen.findByText('myBooks.confirmDeleteAllTitle')).toBeInTheDocument();

            // Cancel
            const cancelBtn = await screen.findByText('common.cancel');
            await user.click(cancelBtn);

            await waitFor(() => {
                expect(screen.queryByText('myBooks.confirmDeleteAllTitle')).not.toBeInTheDocument();
            });

            // Re-open and confirm
            await user.click(delAllBtn);
            const confirmBtn = await screen.findByText('common.delete');
            await user.click(confirmBtn);

            await waitFor(() => {
                expect(screen.queryByText('myBooks.confirmDeleteAllTitle')).not.toBeInTheDocument();
            });
        });
    });

    describe('Pagination & Layout Resize', () => {
        it('handles window resize dynamically for pagination size', async () => {
            // Mock window innerWidth and resize event
            window.innerWidth = 400; // Force mobile
            render(<MyBooks />, { wrapper: createTestWrapper() });

            window.dispatchEvent(new Event('resize'));

            // Wait for elements to respond (since dynamic calculations happen in effect)
            expect(await screen.findByAltText('Test Book 1')).toBeInTheDocument();

            window.innerWidth = 1200; // Desktop
            window.dispatchEvent(new Event('resize'));
        });

        it('shows and handles pagination buttons', async () => {
            const user = userEvent.setup();
            server.use(
                http.get('/api/books', () => {
                    return HttpResponse.json({
                        content: [{ id: 1, title: 'B1' }, { id: 2, title: 'B2' }],
                        totalElements: 20,
                        totalPages: 2,
                        number: 0
                    });
                })
            );

            render(<MyBooks />, { wrapper: createTestWrapper() });

            // Next Page
            const nextBtn = await screen.findByLabelText(/Next Page/i);
            expect(nextBtn).toBeInTheDocument();
            expect(screen.getByLabelText(/Previous Page/i)).toBeDisabled();

            await user.click(nextBtn);

            // Assuming after click, we request page 1 and then prevBtn should be enabled.
            // But we didn't mock the second call, we just want to ensure click handler fires.
            await waitFor(() => {
                expect(screen.getByLabelText(/Previous Page/i)).not.toBeDisabled();
            });
        });
    });
});

import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
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
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    {children}
                </MemoryRouter>
            </QueryClientProvider>
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

        // Wait for Loading to finish and title to appear
        await waitFor(() => expect(screen.getByText(/My Library/i)).toBeInTheDocument());

        // Check if specific books are rendered using more specific selectors
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
});

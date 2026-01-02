import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock GET /api/books
    http.get('/api/books', () => {
        return HttpResponse.json({
            content: [
                {
                    id: 1,
                    title: 'Test Book 1',
                    author: { name: 'Author 1' },
                    coverUrl: 'http://example.com/cover1.jpg',
                    completed: false,
                    currentPage: 0,
                    pageCount: 300,
                    isbn: '111',
                    user: { id: 1 }
                },
                {
                    id: 2,
                    title: 'Test Book 2',
                    author: { name: 'Author 2' },
                    coverUrl: 'http://example.com/cover2.jpg',
                    completed: true,
                    currentPage: 300,
                    pageCount: 300,
                    isbn: '222',
                    user: { id: 1 }
                }
            ],
            totalPages: 1,
            totalElements: 2,
            size: 10,
            number: 0
        });
    }),

    // Mock PATCH /api/books/:id/status
    http.patch('/api/books/:id/status', async ({ params, request }) => {
        const { id } = params;
        const { completed } = await request.json();

        return HttpResponse.json({
            id: Number(id),
            title: 'Test Book ' + id,
            author: { name: 'Author ' + id },
            completed: completed,
            // ...other fields would be here in real app, but for update mutation result, this might suffice
            // or we return a full object structure if the UI relies on it.
            // Let's return a stable full object to avoid crashes.
            coverUrl: 'http://example.com/cover.jpg',
            currentPage: 0,
            pageCount: 300,
            isbn: '123'
        });
    }),

    // Mock PATCH /api/books/:id/progress
    http.patch('/api/books/:id/progress', async ({ params, request }) => {
        const { id } = params;
        const { currentPage } = await request.json();
        return HttpResponse.json({
            id: Number(id),
            title: 'Test Book ' + id,
            author: { name: 'Author ' + id },
            completed: false,
            coverUrl: 'http://example.com/cover.jpg',
            currentPage: currentPage,
            pageCount: 300
        });
    }),

    // Mock DELETE /api/books/:id
    http.delete('/api/books/:id', () => {
        return new HttpResponse(null, { status: 204 });
    })
];

import { authApi } from '../features/auth/api/authApi';
import { booksApi } from '../features/book-search/api/booksApi';
import { sessionsApi } from './sessionsApi';

export { authApi, booksApi, sessionsApi };

export const api = {
    auth: authApi,
    books: booksApi,
    sessions: sessionsApi
};

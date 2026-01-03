import { authApi } from './authApi';
import { booksApi } from './booksApi';
import { sessionsApi } from './sessionsApi';

export { authApi, booksApi, sessionsApi };

export const api = {
    auth: authApi,
    books: booksApi,
    sessions: sessionsApi
};

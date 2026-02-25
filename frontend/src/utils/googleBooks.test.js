import { describe, it, expect } from 'vitest';
import { getHighResImage, mapGoogleBookToNewBook } from './googleBooks';

describe('googleBooks utils', () => {
    describe('getHighResImage', () => {
        it('returns empty string if no url', () => {
            expect(getHighResImage(null)).toBe('');
            expect(getHighResImage(undefined)).toBe('');
            expect(getHighResImage('')).toBe('');
        });

        it('replaces http with https', () => {
            const result = getHighResImage('http://example.com/image.jpg');
            expect(result).toBe('https://example.com/image.jpg');
        });

        it('replaces &zoom=1 with &zoom=0', () => {
            const result = getHighResImage('https://example.com/image.jpg?id=123&zoom=1');
            expect(result).toBe('https://example.com/image.jpg?id=123&zoom=0');
        });

        it('removes &edge=curl', () => {
            const result = getHighResImage('https://example.com/image.jpg?id=123&edge=curl&zoom=1');
            expect(result).toBe('https://example.com/image.jpg?id=123&zoom=0');
        });

        it('applies all transformations correctly combined', () => {
            const input = 'http://books.google.com/books/content?id=xyz&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api';
            const expected = 'https://books.google.com/books/content?id=xyz&printsec=frontcover&img=1&zoom=0&source=gbs_api';
            expect(getHighResImage(input)).toBe(expected);
        });
    });

    describe('mapGoogleBookToNewBook', () => {
        const mockVolumeInfo = {
            title: 'Test Title',
            authors: ['Author One', 'Author Two'],
            publishedDate: '2023-01-01',
            imageLinks: {
                thumbnail: 'http://example.com/thumb.jpg?id=123&zoom=1'
            },
            readingModes: { text: true, image: false },
            pageCount: 350
        };

        it('maps correctly with provided ISBN', () => {
            const isbnInfo = { identifier: '9781234567890' };
            const bookId = 'xyz123';

            const result = mapGoogleBookToNewBook(mockVolumeInfo, isbnInfo, bookId);

            // Expected transformations
            expect(result.isbn).toBe('9781234567890');
            expect(result.coverUrl).toBe('https://example.com/thumb.jpg?id=123&zoom=0');
            expect(result.title).toBe('Test Title');
            expect(result.authorName).toBe('Author One'); // Takes first author
            expect(result.publishDate).toBe('2023-01-01');
            expect(result.readingModes).toEqual({ text: true, image: false });
            expect(result.pageCount).toBe(350);
        });

        it('maps correctly and falls back to ID if no ISBN provided', () => {
            const bookId = 'xyz123';

            const result = mapGoogleBookToNewBook(mockVolumeInfo, null, bookId);

            expect(result.isbn).toBe('ID:xyz123');
        });

        it('handles missing optional fields safely', () => {
            const minimalVolumeInfo = { title: 'Minimal Book' };
            const result = mapGoogleBookToNewBook(minimalVolumeInfo, null, '123');

            expect(result.isbn).toBe('ID:123');
            expect(result.coverUrl).toBe('');
            expect(result.title).toBe('Minimal Book');
            expect(result.authorName).toBe('Unknown Author');
            expect(result.publishDate).toBe('Unknown Date');
            expect(result.pageCount).toBe(0);
            expect(result.readingModes).toBeUndefined();
        });
    });
});

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookCover from './BookCover';

describe('BookCover', () => {
    // Helper to simulate an img element loading or failing
    const simulateImageLoad = (imgElement, width = 200, height = 300) => {
        Object.defineProperty(imgElement, 'naturalWidth', { value: width, configurable: true });
        Object.defineProperty(imgElement, 'naturalHeight', { value: height, configurable: true });
        fireEvent.load(imgElement);
    };

    const simulateImageError = (imgElement) => {
        fireEvent.error(imgElement);
    };

    it('renders with a given Google URL successfully', async () => {
        const book = {
            volumeInfo: {
                title: 'Test Google Book',
                imageLinks: { thumbnail: 'http://example.com/google.jpg' },
                readingModes: { image: true }
            }
        };

        render(<BookCover book={book} />);

        const img = screen.getByRole('img');
        expect(img).toBeDefined();
        // getHighResImage should have upgraded it to https
        expect(img.src).toBe('https://example.com/google.jpg');

        act(() => {
            simulateImageLoad(img);
        });

        // Ensure no fallback text is rendered
        expect(screen.queryByText('Test Google Book')).toBeNull();
    });

    it('falls back to OpenLibrary via ISBN if Google says no image', () => {
        const book = {
            volumeInfo: {
                title: 'No Google Image Book',
                industryIdentifiers: [{ type: 'ISBN_13', identifier: '978-3-16-148410-0' }],
                readingModes: { image: false },
                imageLinks: { thumbnail: 'http://example.com/placeholder.jpg' }
            }
        };

        render(<BookCover book={book} />);

        const img = screen.getByRole('img');
        // Cleaned ISBN: 9783161484100
        expect(img.src).toBe('https://covers.openlibrary.org/b/isbn/9783161484100-L.jpg');
    });

    it('falls back to title/author text if no image URL is possible', () => {
        const book = {
            title: 'No Image Ever',
            authorName: 'Mystery Writer',
            readingModes: { image: false }
            // No ISBN, no imageLinks
        };

        render(<BookCover book={book} />);

        // No img tag should be present
        expect(screen.queryByRole('img')).toBeNull();

        // Fallback text should be shown
        expect(screen.getByText('No Image Ever')).toBeDefined();
        expect(screen.getByText('Mystery Writer')).toBeDefined();
    });

    it('shows Title fallback if Google image errors and no ISBN is available', () => {
        const book = {
            volumeInfo: {
                title: 'Error Google Book',
                imageLinks: { thumbnail: 'http://example.com/bad.jpg' }
            }
        };

        render(<BookCover book={book} />);

        let img = screen.getByRole('img');
        expect(img.src).toBe('https://example.com/bad.jpg');

        act(() => {
            simulateImageError(img);
        });

        // After error, it should show text
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.getByText('Error Google Book')).toBeDefined();
    });

    it('falls back sequentially to OpenLibrary then text on consecutive errors', () => {
        const book = {
            volumeInfo: {
                title: 'Double Error Book',
                imageLinks: { thumbnail: 'http://example.com/bad.jpg' },
                isbn: '1234567890' // Top-level ISBN format
            }
        };

        render(<BookCover book={book} />);

        let img = screen.getByRole('img');
        // 1. Initially tries Google URL
        expect(img.src).toBe('https://example.com/bad.jpg');

        act(() => {
            simulateImageError(img); // Google fails
        });

        // 2. Tries OpenLibrary URL next
        img = screen.getByRole('img');
        expect(img.src).toBe('https://covers.openlibrary.org/b/isbn/1234567890-L.jpg');

        act(() => {
            simulateImageError(img); // OpenLibrary fails
        });

        // 3. Finally falls back to text
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.getByText('Double Error Book')).toBeDefined();
    });

    it('detects OpenLibrary 1x1 pixel image as error and falls back', () => {
        const book = {
            volumeInfo: {
                title: '1x1 Pixel Book',
                readingModes: { image: false },
                isbn: '0987654321'
            }
        };

        render(<BookCover book={book} />);

        const img = screen.getByRole('img');
        expect(img.src).toBe('https://covers.openlibrary.org/b/isbn/0987654321-L.jpg');

        act(() => {
            // Simulate OpenLibrary returning a 1x1 image
            simulateImageLoad(img, 1, 1);
        });

        // Should fall back to text
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.getByText('1x1 Pixel Book')).toBeDefined();
    });

    it('extracts author array properly', () => {
        const book = {
            volumeInfo: {
                title: 'Multi Author Book',
                authors: ['Admin One', 'Admin Two'],
                readingModes: { image: false }
            }
        };
        render(<BookCover book={book} />);
        expect(screen.getByText('Admin One')).toBeDefined();
    });

    it('falls back to ISBN_10 if ISBN_13 is missing', () => {
        const book = {
            volumeInfo: {
                title: 'ISBN 10 Default',
                industryIdentifiers: [{ type: 'ISBN_10', identifier: '0123456789' }],
                readingModes: { image: false }
            }
        };
        render(<BookCover book={book} />);
        const img = screen.getByRole('img');
        expect(img.src).toBe('https://covers.openlibrary.org/b/isbn/0123456789-L.jpg');
    });
});

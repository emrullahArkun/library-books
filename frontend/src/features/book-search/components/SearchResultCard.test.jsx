import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchResultCard from './SearchResultCard';
import * as AnimationContextModule from '../../../context/AnimationContext';

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Mock googleBooks utils
vi.mock('../../../utils/googleBooks', () => ({
    getHighResImage: (url) => url,
}));

describe('SearchResultCard', () => {
    const mockBook = {
        id: '12345',
        volumeInfo: {
            title: 'Test Book',
            imageLinks: { thumbnail: 'http://test.com/img.jpg' },
            industryIdentifiers: [] // No ISBNs to force ID check logic
        }
    };

    const mockFlyBook = vi.fn();
    const mockOnAdd = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the hook implementation
        vi.spyOn(AnimationContextModule, 'useAnimation').mockReturnValue({
            flyBook: mockFlyBook
        });
    });

    const renderCard = (ownedIsbns = new Set()) => {
        return render(
            <SearchResultCard book={mockBook} onAdd={mockOnAdd} ownedIsbns={ownedIsbns} />
        );
    };

    it('triggers animation if book is NOT owned', async () => {
        renderCard(new Set());
        const card = screen.getByRole('button'); // The outer div has role="button"
        fireEvent.click(card);

        expect(mockFlyBook).toHaveBeenCalled();
        expect(mockOnAdd).toHaveBeenCalledWith(mockBook);
    });

    it('does NOT trigger animation if book is owned by ID fallback', async () => {
        const ownedIsbns = new Set(['ID:12345']);
        renderCard(ownedIsbns);
        const card = screen.getByRole('button');
        fireEvent.click(card);

        expect(mockFlyBook).not.toHaveBeenCalled();
        expect(mockOnAdd).toHaveBeenCalledWith(mockBook);
    });
});

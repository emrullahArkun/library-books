import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdateProgressModal from './UpdateProgressModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('UpdateProgressModal', () => {
    const defaultBook = { id: 1, title: 'Test Book', currentPage: 10, pageCount: 200 };
    let onClose, onUpdate;

    beforeEach(() => {
        onClose = vi.fn();
        onUpdate = vi.fn();
    });

    it('should render with current page', () => {
        render(<UpdateProgressModal book={defaultBook} onClose={onClose} onUpdate={onUpdate} />);
        expect(screen.getByDisplayValue('10')).toBeDefined();
    });

    it('should call onUpdate with parsed page number', () => {
        render(<UpdateProgressModal book={defaultBook} onClose={onClose} onUpdate={onUpdate} />);

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '50' } });
        fireEvent.click(screen.getByText('modal.save'));

        expect(onUpdate).toHaveBeenCalledWith(1, 50);
    });

    it('should show error for negative page number', () => {
        render(<UpdateProgressModal book={defaultBook} onClose={onClose} onUpdate={onUpdate} />);

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '-5' } });
        fireEvent.submit(screen.getByDisplayValue('-5').closest('form'));

        expect(screen.getByText('modal.error.negative')).toBeDefined();
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should show error when exceeding page count', () => {
        render(<UpdateProgressModal book={defaultBook} onClose={onClose} onUpdate={onUpdate} />);

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '250' } });
        fireEvent.submit(screen.getByDisplayValue('250').closest('form'));

        expect(screen.getByText('modal.error.exceed')).toBeDefined();
        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should allow any page when pageCount is null/undefined', () => {
        const bookNoPages = { id: 1, title: 'T', currentPage: 0, pageCount: null };
        render(<UpdateProgressModal book={bookNoPages} onClose={onClose} onUpdate={onUpdate} />);

        fireEvent.change(screen.getByDisplayValue('0'), { target: { value: '100' } });
        fireEvent.click(screen.getByText('modal.save'));

        expect(onUpdate).toHaveBeenCalledWith(1, 100);
    });

    it('should call onClose on cancel', () => {
        render(<UpdateProgressModal book={defaultBook} onClose={onClose} onUpdate={onUpdate} />);
        fireEvent.click(screen.getByText('modal.cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('should handle missing currentPage (default to 0)', () => {
        const bookNoPage = { id: 1, title: 'T', pageCount: 100 };
        render(<UpdateProgressModal book={bookNoPage} onClose={onClose} onUpdate={onUpdate} />);
        expect(screen.getByDisplayValue('0')).toBeDefined();
    });

});

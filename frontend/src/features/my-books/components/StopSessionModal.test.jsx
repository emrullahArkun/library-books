import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StopSessionModal from './StopSessionModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
        ...actual,
        useToast: () => mockToast,
    };
});

describe('StopSessionModal', () => {
    let onClose, onConfirm;

    beforeEach(() => {
        onClose = vi.fn();
        onConfirm = vi.fn();
        mockToast.mockClear();
    });

    const renderModal = (props = {}) => {
        return render(
            <StopSessionModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                currentBookPage={10}
                maxPages={200}
                {...props}
            />
        );
    };

    it('should render step 1 initially', () => {
        renderModal();
        expect(screen.getByText('readingSession.stopModal.title')).toBeDefined();
        expect(screen.getAllByText('readingSession.stopModal.confirm').length).toBeGreaterThan(0);
        // The confirm button text is also "readingSession.stopModal.confirm" but let's check for buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(1); // Close, Confirm, Cancel
    });

    it('should call onClose when cancel is clicked in step 1', () => {
        renderModal();
        fireEvent.click(screen.getByText('readingSession.stopModal.cancel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('should transition to step 2 when confirm is clicked in step 1', () => {
        renderModal();
        // There are two elements with "readingSession.stopModal.confirm" (text and button). 
        // We select the button.
        const confirmButtons = screen.getAllByText('readingSession.stopModal.confirm');
        const button = confirmButtons.find(el => el.tagName === 'BUTTON');
        fireEvent.click(button);

        expect(screen.getAllByText('readingSession.stopModal.pageTitle').length).toBeGreaterThan(0);
        expect(screen.getByDisplayValue('10')).toBeDefined();
    });

    it('should call onClose and reset to step 1 when abort is clicked in step 2', () => {
        renderModal();
        // Go to step 2
        const confirmButtons = screen.getAllByText('readingSession.stopModal.confirm');
        fireEvent.click(confirmButtons.find(el => el.tagName === 'BUTTON'));

        // Click abort
        fireEvent.click(screen.getByText('readingSession.stopModal.abort'));
        expect(onClose).toHaveBeenCalled();
    });

    it('should trigger onConfirm with parsed page when submit is clicked in step 2', () => {
        renderModal();
        // Go to step 2
        const confirmButtons = screen.getAllByText('readingSession.stopModal.confirm');
        fireEvent.click(confirmButtons.find(el => el.tagName === 'BUTTON'));

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '50' } });
        fireEvent.click(screen.getByText('readingSession.stopModal.submit'));

        expect(onConfirm).toHaveBeenCalledWith(50);
        expect(mockToast).not.toHaveBeenCalled();
    });

    it('should show error toast if page exceeds maxPages', () => {
        renderModal();
        // Go to step 2
        const confirmButtons = screen.getAllByText('readingSession.stopModal.confirm');
        fireEvent.click(confirmButtons.find(el => el.tagName === 'BUTTON'));

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '250' } });
        fireEvent.click(screen.getByText('readingSession.stopModal.submit'));

        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            status: 'error',
            title: 'readingSession.stopModal.maxPagesError'
        }));
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should allow submitting without maxPages constraint if maxPages is undefined', () => {
        renderModal({ maxPages: undefined });

        const confirmButtons = screen.getAllByText('readingSession.stopModal.confirm');
        fireEvent.click(confirmButtons.find(el => el.tagName === 'BUTTON'));

        fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '500' } });
        fireEvent.click(screen.getByText('readingSession.stopModal.submit'));

        expect(onConfirm).toHaveBeenCalledWith(500);
        expect(mockToast).not.toHaveBeenCalled();
    });
});

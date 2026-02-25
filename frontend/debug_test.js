import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UpdateProgressModal from './src/features/my-books/components/UpdateProgressModal.jsx';

// Simple mock for i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k })
}));

const defaultBook = { id: 1, title: 'Test Book', currentPage: 10, pageCount: 200 };

const { container } = render(<UpdateProgressModal book={defaultBook} onClose={() => {}} onUpdate={() => {}} />);
fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '250' } });
fireEvent.click(screen.getByText('modal.save'));

console.log(container.innerHTML);

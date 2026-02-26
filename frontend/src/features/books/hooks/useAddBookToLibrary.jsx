import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { booksApi } from '../../books/api';
import { mapGoogleBookToNewBook } from '../../../utils/googleBooks';

export const useAddBookToLibrary = () => {
    const { token, user } = useAuth();
    const toast = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (book) => {
            if (!token) throw new Error(t('search.toast.loginRequired'));

            const volumeInfo = book.volumeInfo;
            const isbnInfo = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')
                || volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10');

            if (!isbnInfo && !book.id) throw new Error(t('search.toast.noIsbn'));

            // Use utility for mapping logic
            const newBook = mapGoogleBookToNewBook(volumeInfo, isbnInfo, book.id);

            // FALLBACK: If pageCount is 0 or missing, try OpenLibrary
            if ((!newBook.pageCount || newBook.pageCount === 0) && newBook.isbn) {
                try {
                    // Extract ISBN (remove "ID:" prefix if it exists, though mapGoogleBookToNewBook puts ISBN directly if available)
                    // If it used the ID fallback, it starts with ID:. OpenLibrary needs actual ISBN.
                    // isbnInfo was already found above, so we can use that directly for safety
                    if (isbnInfo) {
                        const cleanIsbn = isbnInfo.identifier;
                        const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
                        const response = await fetch(olUrl);
                        if (response.ok) {
                            const data = await response.json();
                            const bookKey = `ISBN:${cleanIsbn}`;
                            if (data[bookKey] && data[bookKey].number_of_pages) {
                                newBook.pageCount = data[bookKey].number_of_pages;
                                console.log(`Updated page count from OpenLibrary for ${newBook.title}: ${newBook.pageCount}`);
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Failed to fetch page count from OpenLibrary:', error);
                    // Silently fail fallback and proceed with 0 pages
                }
            }

            return await booksApi.create(newBook);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            queryClient.invalidateQueries({ queryKey: ['ownedIsbns', user?.email] });
            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                position: 'top',
                duration: 3000,
                containerStyle: {
                    marginTop: '80px'
                },
                render: () => (
                    <div style={{
                        backgroundColor: '#38A169', // green.500
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        Buch wurde erfolgreich hinzugefügt
                    </div>
                )
            });
        },
        onError: (err) => {
            // Check if it's a duplicate error based on the status code
            const isDuplicate = err.status === 409;
            const message = isDuplicate ? 'Buch gibt es schon in der Sammlung' : (err.message || t('search.toast.addFailed'));
            const bgColor = isDuplicate ? '#DD6B20' : '#E53E3E'; // orange.500 : red.500

            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                position: 'top',
                duration: 3000,
                containerStyle: {
                    marginTop: '80px'
                },
                render: () => (
                    <div style={{
                        backgroundColor: bgColor,
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )
            });
        }
    });
};

import { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';

export const useBookStats = (bookId) => {
    const { token } = useAuth();
    const [book, setBook] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token || !bookId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch book details
                const bookData = await api.books.getById(bookId);
                setBook(bookData);

                // Fetch sessions
                const sessionsData = await api.sessions.getByBookId(bookId);
                if (sessionsData) {
                    setSessions(sessionsData);
                }
            } catch (err) {
                setError(err);
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [bookId, token]);

    return { book, sessions, loading, error };
};

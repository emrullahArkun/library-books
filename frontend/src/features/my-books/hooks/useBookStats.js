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
                const bookRes = await api.books.getById(bookId);
                if (!bookRes.ok) throw new Error("Failed to fetch book");
                const bookData = await bookRes.json();
                setBook(bookData);

                // Fetch sessions
                const sessionsRes = await api.sessions.getByBookId(bookId);
                if (sessionsRes.ok) {
                    const sessionsData = await sessionsRes.json();
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

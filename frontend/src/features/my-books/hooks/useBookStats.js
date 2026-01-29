import { useState, useEffect } from 'react';
import { booksApi } from '../../books/api';
import { sessionsApi } from '../api/sessionsApi';
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
                const [bookData, sessionsData] = await Promise.all([
                    booksApi.getById(bookId),
                    sessionsApi.getByBookId(bookId)
                ]);

                setBook(bookData);
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

    const refetch = async () => {
        setLoading(true);
        try {
            const bookData = await booksApi.getById(bookId);
            setBook(bookData);
            const sessionsData = await sessionsApi.getByBookId(bookId);
            if (sessionsData) setSessions(sessionsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { book, sessions, loading, error, refetch };
};

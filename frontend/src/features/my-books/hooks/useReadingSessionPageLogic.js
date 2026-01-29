import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useReadingSession } from './useReadingSession';
import { booksApi } from '../../books/api';

export const useReadingSessionPageLogic = (bookId) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useAuth();

    // Global Session logic
    const {
        activeSession,
        startSession,
        stopSession,
        formattedTime,
        loading: sessionLoading,
        isPaused,
        pauseSession,
        resumeSession,
        isController,
        takeControl
    } = useReadingSession();

    // Local State
    const [book, setBook] = useState(null);
    const [fetchingBook, setFetchingBook] = useState(true);
    const [note, setNote] = useState('');
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [endPage, setEndPage] = useState('');
    const [hasStopped, setHasStopped] = useState(false);
    const [wasActive, setWasActive] = useState(false);

    // 1. Fetch book details
    useEffect(() => {
        if (!token) return;
        const fetchBook = async () => {
            try {
                const data = await booksApi.getById(bookId);
                if (data) {
                    setBook(data);
                    if (data.currentPage) setEndPage(data.currentPage);
                }
            } catch (error) {
                console.error("Failed to fetch book", error);
            } finally {
                setFetchingBook(false);
            }
        };
        fetchBook();
    }, [bookId, token]);

    // 2. Check for session mismatch
    useEffect(() => {
        if (activeSession && book && activeSession.bookId !== book.id) {
            alert(t('readingSession.alerts.mismatch'));
            navigate('/my-books');
        }
    }, [activeSession, book, navigate, t]);

    // 3. Track active session / Remote end
    useEffect(() => {
        if (activeSession) {
            setWasActive(true);
        } else if (wasActive && !activeSession && !hasStopped) {
            alert(t('readingSession.alerts.endedRemote'));
            navigate('/my-books');
        }
    }, [activeSession, wasActive, hasStopped, navigate, t]);

    // 4. Auto-start session
    const isStartingRef = useRef(false);
    useEffect(() => {
        if (!sessionLoading && !activeSession && book && !hasStopped && !wasActive) {
            if (isStartingRef.current) return;
            isStartingRef.current = true;

            startSession(bookId).finally(() => {
                isStartingRef.current = false;
            });
        }
    }, [sessionLoading, activeSession, book, bookId, startSession, hasStopped, wasActive]);

    // 5. Navigation Guard
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (activeSession) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handlePopState = (e) => {
            if (activeSession) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
                alert(t('readingSession.alerts.exitWarning'));
            }
        };

        if (activeSession) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [activeSession, t]);

    // Handlers
    const handleBackClick = () => {
        if (activeSession) {
            if (window.confirm(t('readingSession.alerts.exitConfirm'))) {
                navigate('/my-books');
            }
        } else {
            navigate('/my-books');
        }
    };

    const handleStopClick = () => {
        if (!isPaused) {
            pauseSession();
        }
        setShowStopConfirm(true);
    };

    const handleStopCancel = () => {
        setShowStopConfirm(false);
        resumeSession();
    };

    const handleConfirmStop = async () => {
        const pageNum = parseInt(endPage, 10);
        if (isNaN(pageNum)) return;

        const startPage = book.currentPage || 0;
        const pagesRead = pageNum - startPage;

        setHasStopped(true);
        const success = await stopSession(new Date(), pageNum);
        if (success) {
            alert(t('readingSession.alerts.summary', { pages: pagesRead > 0 ? pagesRead : 0 }));
            navigate('/my-books');
        }
    };

    return {
        book,
        fetchingBook,
        note,
        setNote,
        activeSession,
        sessionLoading,
        formattedTime,
        isPaused,
        resumeSession,
        pauseSession,
        isController,
        takeControl,
        showStopConfirm,
        endPage,
        setEndPage,
        handleBackClick,
        handleStopClick,
        handleStopCancel,
        handleConfirmStop
    };
};

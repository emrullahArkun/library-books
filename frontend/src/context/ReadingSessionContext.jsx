import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/api';

const ReadingSessionContext = createContext(null);

export const ReadingSessionProvider = ({ children }) => {
    const { token } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Pause state
    const [isPaused, setIsPaused] = useState(false);
    const [pausedAt, setPausedAt] = useState(null);

    // Refs for timer logic to avoid dependecy/closure issues
    const timerIntervalRef = useRef(null);

    // Fetch active session on mount/token change
    useEffect(() => {
        if (!token) {
            setActiveSession(null);
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const response = await api.sessions.getActive();

                if (response.status === 204) {
                    setActiveSession(null);
                } else if (response.ok) {
                    const session = await response.json();
                    setActiveSession(session);
                }
            } catch (err) {
                console.error("Failed to fetch active session", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [token]);

    // Timer Logic
    useEffect(() => {
        if (!activeSession?.startTime || isPaused) {
            setElapsedSeconds(0); // Optional: keep last known time if paused?
            if (activeSession && isPaused && pausedAt) {
                // Calculate static elapsed time up to pause
                const start = new Date(activeSession.startTime).getTime();
                const pauseTime = new Date(pausedAt).getTime();
                const pausedMillis = activeSession.pausedMillis || 0;
                if (!isNaN(start) && !isNaN(pauseTime)) {
                    setElapsedSeconds(Math.max(0, Math.floor((pauseTime - start - pausedMillis) / 1000)));
                }
            } else if (!activeSession) {
                setElapsedSeconds(0);
            }
            return;
        }

        const tick = () => {
            const startRaw = activeSession.startTime;
            const start = new Date(startRaw).getTime();
            const now = new Date().getTime();

            if (isNaN(start)) {
                setElapsedSeconds(0);
                return;
            }

            const pausedMillis = activeSession.pausedMillis || 0;
            const diff = Math.floor((now - start - pausedMillis) / 1000);
            setElapsedSeconds(Math.max(0, diff));
        };

        tick();
        timerIntervalRef.current = setInterval(tick, 1000);

        return () => clearInterval(timerIntervalRef.current);
    }, [activeSession, isPaused, pausedAt]);


    const startSession = async (bookId) => {
        try {
            const response = await api.sessions.start(bookId);

            if (!response.ok) throw new Error('Failed to start session');
            const session = await response.json();
            setActiveSession(session);
            setIsPaused(false);
            setPausedAt(null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const stopSession = async (endTime, endPage) => {
        try {
            const response = await api.sessions.stop(endTime, endPage);

            if (!response.ok) throw new Error('Failed to stop session');

            setActiveSession(null);
            setIsPaused(false);
            setPausedAt(null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const pauseSession = () => {
        setIsPaused(true);
        setPausedAt(new Date());
        // Simple local pause, sync with backend on resume?
    };

    const resumeSession = async () => {
        if (pausedAt) {
            const now = new Date();
            const diff = now.getTime() - new Date(pausedAt).getTime();
            if (diff > 0) {
                // Optimistic update: update local state immediately to prevent timer flicker
                setActiveSession(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        pausedMillis: (prev.pausedMillis || 0) + diff
                    };
                });

                // Sync with backend
                excludeTimeFromSession(diff);
            }
        }
        setIsPaused(false);
        setPausedAt(null);
    };

    const excludeTimeFromSession = async (millis) => {
        try {
            const response = await api.sessions.excludeTime(millis);

            if (response.ok) {
                const data = await response.json();
                setActiveSession(data);
            }
        } catch (err) {
            console.error("Failed to exclude time", err);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    return (
        <ReadingSessionContext.Provider value={{
            activeSession,
            loading,
            elapsedSeconds,
            formattedTime: formatTime(elapsedSeconds),
            isPaused,
            startSession,
            stopSession,
            pauseSession,
            resumeSession
        }}>
            {children}
        </ReadingSessionContext.Provider>
    );
};

export const useReadingSessionContext = () => {
    const context = useContext(ReadingSessionContext);
    if (!context) {
        throw new Error('useReadingSessionContext must be used within a ReadingSessionProvider');
    }
    return context;
};

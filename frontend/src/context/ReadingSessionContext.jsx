import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { sessionsApi } from '../features/reading-sessions/api/sessionsApi';
import { useControllerLock } from '../shared/hooks/useControllerLock';

const ReadingSessionContext = createContext(null);

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
};

export const ReadingSessionProvider = ({ children }) => {
    const { token } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Pause state derived from activeSession
    const isPaused = activeSession?.status === 'PAUSED';

    // Refs for timer logic to avoid dependency/closure issues
    const timerIntervalRef = useRef(null);
    const broadcastChannelRef = useRef(null);

    const refreshSession = useCallback(async () => {
        if (!token) return;
        try {
            const session = await sessionsApi.getActive();
            setActiveSession(session); // apiClient returns null for 204
        } catch (err) {
            console.error("Failed to refresh session", err);
        }
    }, [token]);

    // Initialize BroadcastChannel
    useEffect(() => {
        broadcastChannelRef.current = new BroadcastChannel('reading_session_sync');
        broadcastChannelRef.current.onmessage = (event) => {
            if (event.data === 'REFRESH_SESSION') {
                refreshSession();
            }
        };

        // Fallback for storage event (if BroadcastChannel fails or for some browsers)
        const handleStorage = (e) => {
            // Ignore lock updates to prevent API flooding (heartbeat writes every 2s)
            if (e.key === 'reading_session_controller_lock') return;
            refreshSession();
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', refreshSession);

        return () => {
            if (broadcastChannelRef.current) broadcastChannelRef.current.close();
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', refreshSession);
        };
    }, [token, refreshSession]);

    // Fetch active session on mount/token change
    useEffect(() => {
        if (!token) {
            setActiveSession(null);
            setLoading(false);
            return;
        }
        refreshSession().finally(() => setLoading(false));
    }, [token, refreshSession]);

    const broadcastUpdate = () => {
        if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage('REFRESH_SESSION');
        }
    };

    // Timer Logic
    useEffect(() => {
        if (!activeSession) {
            setElapsedSeconds(0);
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

            if (activeSession.status === 'PAUSED' && activeSession.pausedAt) {
                const pAt = new Date(activeSession.pausedAt).getTime();
                const diff = Math.floor((pAt - start - pausedMillis) / 1000);
                setElapsedSeconds(Math.max(0, diff));
            } else {
                const diff = Math.floor((now - start - pausedMillis) / 1000);
                setElapsedSeconds(Math.max(0, diff));
            }
        };

        tick();

        if (activeSession.status === 'ACTIVE') {
            timerIntervalRef.current = setInterval(tick, 1000);
        }

        return () => clearInterval(timerIntervalRef.current);
    }, [activeSession]);

    // Controller Lock
    const { isController, takeControl } = useControllerLock(activeSession);

    const startSession = useCallback(async (bookId) => {
        try {
            const session = await sessionsApi.start(bookId);
            setActiveSession(session);
            takeControl();
            broadcastUpdate();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [takeControl]);

    const stopSession = useCallback(async (endTime, endPage) => {
        try {
            await sessionsApi.stop(endTime, endPage);
            setActiveSession(null);
            broadcastUpdate();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, []);

    const pauseSession = useCallback(async () => {
        if (!isController) return;
        try {
            const session = await sessionsApi.pause();
            setActiveSession(session);
            broadcastUpdate();
        } catch (err) {
            console.error("Failed to pause session", err);
        }
    }, [isController]);

    const resumeSession = useCallback(async () => {
        if (!isController) return;
        try {
            const session = await sessionsApi.resume();
            setActiveSession(session);
            broadcastUpdate();
        } catch (err) {
            console.error("Failed to resume session", err);
        }
    }, [isController]);

    const value = useMemo(() => ({
        activeSession,
        loading,
        elapsedSeconds,
        formattedTime: formatTime(elapsedSeconds),
        isPaused,
        startSession,
        stopSession,
        pauseSession,
        resumeSession,
        isController,
        takeControl
    }), [activeSession, loading, elapsedSeconds, isPaused, startSession, stopSession, pauseSession, resumeSession, isController, takeControl]);

    return (
        <ReadingSessionContext.Provider value={value}>
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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useReadingSession = () => {
    const { token } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startOffset, setStartOffset] = useState(0);
    const [startOffsetSet, setStartOffsetSet] = useState(false);

    // Pause state (Global Sync)
    const [isPaused, setIsPaused] = useState(false);
    const [pausedAt, setPausedAt] = useState(null);
    const [frozenTime, setFrozenTime] = useState(null);

    // Broadcast Channel
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        const bc = new BroadcastChannel('reading_session_sync');
        setChannel(bc);
        bc.onmessage = (event) => {
            const { type, payload } = event.data;
            if (event.data?.bookId && activeSession?.bookId && event.data.bookId !== activeSession.bookId) {
                // Ignore events for other books? Or general sync?
                // Probably strict sync for same book.
                return;
            }

            if (type === 'PAUSE') {
                setIsPaused(true);
                setPausedAt(new Date(payload.pausedAt));
                setFrozenTime(payload.frozenTime);
            } else if (type === 'RESUME') {
                setIsPaused(false);
                setPausedAt(null);
                setFrozenTime(null);
                // Also trigger excludeTime? Handled by sender via API, but receiver needs to refetch or adjust?
                // Sender calls `excludeTimeFromSession`. Receivers will get updated `activeSession` via API polling or we triggering re-fetch.
                // Re-fetch is safest.
                // For now, let's trust timer logic will adjust once we refetch.
            } else if (type === 'STOP') {
                setActiveSession(null);
                setIsPaused(false);
                setPausedAt(null);
                setFrozenTime(null);
                setStartOffset(0);
            }
        };

        return () => bc.close();
    }, [activeSession]);

    // Initialize state from localStorage if matching session
    useEffect(() => {
        if (activeSession) {
            const stored = localStorage.getItem(`reading_session_${activeSession.bookId}`);
            if (stored) {
                const { isPaused: storedPaused, pausedAt: storedAt, frozenTime: storedFrozen } = JSON.parse(stored);
                if (storedPaused) {
                    setIsPaused(true);
                    setPausedAt(new Date(storedAt));
                    setFrozenTime(storedFrozen);
                }
            }
        }
    }, [activeSession?.bookId]); // Run when bookId changes (session starts/loads)

    // Fetch active session on mount
    useEffect(() => {
        if (!token) {
            setActiveSession(null);
            setLoading(false);
            setStartOffset(0);
            setStartOffsetSet(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/sessions/active?_t=${new Date().getTime()}`, {
                    headers: {
                        'Authorization': `Basic ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    cache: 'no-store'
                });

                if (response.status === 204) {
                    // console.log("No active session (204)");
                    setActiveSession(null);
                    setStartOffset(0);
                    setStartOffsetSet(false);
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

    // Timer logic
    useEffect(() => {
        if (!activeSession?.startTime) {
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

            const diff = Math.floor((now - start) / 1000);

            // Calculate offset ONCE if session is fresh (< 10s old) and not yet offset
            // This makes the timer start at 0:00 visually for the user even if server time is 0:03.
            if (!startOffsetSet && diff < 10) {
                setStartOffset(diff);
                setStartOffsetSet(true);
            }

            // Apply offset if set
            const adjustedDiff = diff - startOffset;
            setElapsedSeconds(Math.max(0, adjustedDiff));
        };

        tick(); // Initial update
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [activeSession]);

    const startSession = async (bookId) => {
        console.log("Attempting to start session for book:", bookId);
        try {
            const response = await fetch('/api/sessions/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ bookId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Start session failed:", response.status, errorText);
                throw new Error(errorText || 'Failed to start session');
            }

            const session = await response.json();
            setActiveSession(session);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const stopSession = async (endTime, endPage) => {
        try {
            const bodyData = {};
            if (endTime) bodyData.endTime = endTime.toISOString();
            if (endPage !== undefined) bodyData.endPage = endPage;

            const response = await fetch('/api/sessions/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) throw new Error('Failed to stop session');

            if (activeSession) {
                localStorage.removeItem(`reading_session_${activeSession.bookId}`);
                channel?.postMessage({ type: 'STOP', bookId: activeSession.bookId });
            }

            setActiveSession(null);
            setStartOffset(0);
            setStartOffsetSet(false);
            setIsPaused(false);
            setFrozenTime(null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const pauseSession = () => {
        const now = new Date();
        const currentFrozen = formatTime(elapsedSeconds); // Capture current time

        setIsPaused(true);
        setPausedAt(now);
        setFrozenTime(currentFrozen);

        const state = { isPaused: true, pausedAt: now.toISOString(), frozenTime: currentFrozen };
        if (activeSession) {
            localStorage.setItem(`reading_session_${activeSession.bookId}`, JSON.stringify(state));
            channel?.postMessage({ type: 'PAUSE', payload: state, bookId: activeSession.bookId });
        }
    };

    const resumeSession = () => {
        if (pausedAt) {
            const now = new Date();
            const diff = now.getTime() - pausedAt.getTime();
            if (diff > 0) {
                excludeTimeFromSession(diff);
            }
        }

        setIsPaused(false);
        setPausedAt(null);
        setFrozenTime(null);

        if (activeSession) {
            localStorage.removeItem(`reading_session_${activeSession.bookId}`);
            channel?.postMessage({ type: 'RESUME', bookId: activeSession.bookId });
        }
    };

    const excludeTimeFromSession = async (millis) => {
        // Optimistic update
        if (activeSession && activeSession.startTime) {
            try {
                const oldStart = new Date(activeSession.startTime).getTime();
                if (!isNaN(oldStart)) {
                    const newStart = new Date(oldStart + millis).toISOString();
                    setActiveSession({ ...activeSession, startTime: newStart });
                }
            } catch (e) {
                console.warn("Optimistic update failed", e);
            }
        }

        try {
            const response = await fetch('/api/sessions/active/exclude-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: JSON.stringify({ millis })
            });

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

    return {
        activeSession,
        loading,
        elapsedSeconds,
        formattedTime: formatTime(elapsedSeconds),
        isPaused,
        pausedAt,
        frozenTime,
        pauseSession,
        resumeSession,
        startSession,
        stopSession,
        excludeTimeFromSession
    };
};

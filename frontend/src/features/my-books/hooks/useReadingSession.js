import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useReadingSession = () => {
    const { token } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Fetch active session on mount
    useEffect(() => {
        if (!token) return;

        const fetchSession = async () => {
            try {
                const response = await fetch('/api/sessions/active', {
                    headers: { 'Authorization': `Basic ${token}` }
                });

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

    // Timer logic
    useEffect(() => {
        if (!activeSession?.startTime) {
            setElapsedSeconds(0);
            return;
        }

        const tick = () => {
            const start = new Date(activeSession.startTime).getTime();
            const now = new Date().getTime();
            setElapsedSeconds(Math.floor((now - start) / 1000));
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

    const stopSession = async (endTime) => {
        try {
            const body = endTime ? JSON.stringify({ endTime: endTime.toISOString() }) : '{}';
            const response = await fetch('/api/sessions/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`
                },
                body: body
            });

            if (!response.ok) throw new Error('Failed to stop session');

            setActiveSession(null);
            return true;
        } catch (err) {
            console.error(err);
            return false;
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
        startSession,
        stopSession,
        excludeTimeFromSession
    };
};

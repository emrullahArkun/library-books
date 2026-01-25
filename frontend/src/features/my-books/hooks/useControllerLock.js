import { useState, useEffect, useCallback, useRef } from 'react';

const LOCK_KEY = 'reading_session_controller_lock';
const LOCK_TTL_MS = 5000; // Lock expires in 5s
const HEARTBEAT_INTERVAL_MS = 2000; // Renew every 2s

// Helper to generate a unique ID for this tab
const generateTabId = () => {
    return 'tab_' + Math.random().toString(36).substr(2, 9);
};

export const useControllerLock = () => {
    const [isController, setIsController] = useState(false);
    const [tabId] = useState(generateTabId());
    const [controllerId, setControllerId] = useState(null); // Who is the current controller?

    const heartbeatRef = useRef(null);
    const checkRef = useRef(null);

    // Function to acquire or renew the lock
    const acquireLock = useCallback(() => {
        const now = Date.now();
        const lockData = {
            controllerId: tabId,
            expiresAt: now + LOCK_TTL_MS
        };
        localStorage.setItem(LOCK_KEY, JSON.stringify(lockData));
        setIsController(true);
        setControllerId(tabId);
    }, [tabId]);

    // Function to check lock status
    const checkLock = useCallback(() => {
        const raw = localStorage.getItem(LOCK_KEY);
        const now = Date.now();

        if (!raw) {
            // No lock exists, we can take it (optional auto-take logic could go here, but let's be passive unless we started it)
            // or if we are already controller, we should re-acquire?
            setControllerId(null);
            if (isController) {
                // We lost it? or it was cleared. Re-acquire if we think we are controller?
                acquireLock();
            } else {
                setIsController(false);
            }
            return;
        }

        try {
            const lock = JSON.parse(raw);
            if (lock.expiresAt > now) {
                // Valid lock
                setControllerId(lock.controllerId);
                const amIController = lock.controllerId === tabId;
                setIsController(amIController);
            } else {
                // Expired lock
                setControllerId(null);
                if (isController) {
                    // We were controller, but expired? Renew.
                    acquireLock();
                } else {
                    // Someone else expired. We *could* take it, but let's wait for user action or "Take Over"
                    setIsController(false);
                }
            }
        } catch (e) {
            // Corrupt
            setControllerId(null);
            setIsController(false);
        }
    }, [tabId, isController, acquireLock]);

    // Heartbeat: If I am controller, renew lock
    useEffect(() => {
        if (isController) {
            acquireLock(); // Initial write
            heartbeatRef.current = setInterval(acquireLock, HEARTBEAT_INTERVAL_MS);
        } else {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        }

        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        };
    }, [isController, acquireLock]);

    // Monitoring: Check others
    useEffect(() => {
        // Run check immediately
        checkLock();
        checkRef.current = setInterval(checkLock, 1000); // Check frequently

        // Also listen for storage events to update React state faster
        const handleStorage = (e) => {
            if (e.key === LOCK_KEY) {
                checkLock();
            }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            if (checkRef.current) clearInterval(checkRef.current);
            window.removeEventListener('storage', handleStorage);
        };
    }, [checkLock]);

    // Auto-acquire if we start a new session (detected via activeSession becoming distinct?)
    // Actually, context usually handles "Start" -> "Take Over" explicitly.

    // Cleanup on unmount (release lock?) -> NO, let it expire. 
    // If we release, another tab might flip out. Expiration is safer for crashes.

    return {
        isController,
        controllerId,
        tabId,
        takeControl: acquireLock
    };
};

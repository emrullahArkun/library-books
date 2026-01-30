import { useEffect } from 'react';

export const usePinstripeBackground = () => {
    useEffect(() => {
        document.body.style.backgroundColor = 'var(--accent-800)';
        document.body.style.backgroundImage = `repeating-linear-gradient(
            to right,
            transparent,
            transparent 39px,
            rgba(0, 0, 0, 0.1) 40px,
            rgba(0, 0, 0, 0.1) 41px
        )`;

        // Reset when leaving
        return () => {
            // If we want to be very safe, we could restore original. 
            // Most valid usage: restore to default app theme.
            // If the user navigates from Pinstripe -> Pinstripe, the next hook will override anyway.
            // If Pinstripe -> Normal, we want Normal.

            // To be consistent with existing logic in BookStatsPage (which tried to save original), 
            // but simply resetting to var(--bg-app) is cleaner and more predictable for "Normal" pages.
            // Let's stick to the plan: reset to default.

            document.body.style.backgroundColor = 'var(--bg-app)';
            document.body.style.backgroundImage = 'none';
        };
    }, []);
};

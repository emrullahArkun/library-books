import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookStatsCalculations } from './useBookStatsCalculations';

describe('useBookStatsCalculations', () => {
    // --- stats ---

    it('should return null stats when sessions is null', () => {
        const { result } = renderHook(() => useBookStatsCalculations({ pageCount: 100 }, null));
        expect(result.current.stats).toBeNull();
    });

    it('should return null stats when book is null', () => {
        const { result } = renderHook(() => useBookStatsCalculations(null, []));
        expect(result.current.stats).toBeNull();
    });

    it('should calculate basic stats', () => {
        const book = { currentPage: 50, pageCount: 200 };
        const sessions = [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T11:00:00Z', endPage: 50 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        const { stats } = result.current;

        expect(stats.pagesRead).toBe(50);
        expect(stats.totalPages).toBe(200);
        expect(stats.totalTime).toBe('1h 0m');
        expect(stats.speed).toBe('50.0'); // 50 pages / 1 hour
        expect(stats.progressPercent).toBe(25); // 50/200
    });

    it('should handle zero speed (no sessions with endTime)', () => {
        const book = { currentPage: 0, pageCount: 100 };
        const sessions = [{ startTime: '2025-01-01T10:00:00Z' }]; // no endTime

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.speed).toBe('0.0');
        expect(result.current.stats.timeLeft).toBeNull();
    });

    it('should calculate timeLeft when speed > 0 and pages left > 0', () => {
        const book = { currentPage: 50, pageCount: 200 };
        const sessions = [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T11:00:00Z', endPage: 50 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        // 150 pages left / 50 pages per hour = 3 hours
        expect(result.current.stats.timeLeft).toBe('3h 0m');
    });

    it('should set timeLeft to null when book is complete', () => {
        const book = { currentPage: 200, pageCount: 200 };
        const sessions = [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T11:00:00Z', endPage: 200 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.timeLeft).toBeNull(); // 0 pages left
    });

    it('should handle null currentPage and pageCount', () => {
        const book = { currentPage: null, pageCount: null };
        const sessions = [];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.pagesRead).toBe(0);
        expect(result.current.stats.progressPercent).toBe(0);
    });

    it('should cap progressPercent at 100', () => {
        const book = { currentPage: 250, pageCount: 200 }; // Overcounted
        const sessions = [];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.progressPercent).toBe(100);
    });

    it('should group sessions by day and keep latest per day for graph', () => {
        const book = { currentPage: 80, pageCount: 200 };
        const sessions = [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T11:00:00Z', endPage: 30 },
            { startTime: '2025-01-01T14:00:00Z', endTime: '2025-01-01T15:00:00Z', endPage: 50 }, // same day, later
            { startTime: '2025-01-02T10:00:00Z', endTime: '2025-01-02T11:00:00Z', endPage: 80 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.graphData.length).toBe(2); // 2 unique days
    });

    it('should skip sessions without endTime or null endPage in graph', () => {
        const book = { currentPage: 50, pageCount: 100 };
        const sessions = [
            { startTime: '2025-01-01T10:00:00Z', endTime: '2025-01-01T11:00:00Z', endPage: null },
            { startTime: '2025-01-02T10:00:00Z', endPage: 30 }, // no endTime
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.stats.graphData.length).toBe(0);
    });

    // --- goalProgress ---

    it('should return null goalProgress when no goal set', () => {
        const book = { currentPage: 50, pageCount: 200 };
        const { result } = renderHook(() => useBookStatsCalculations(book, []));
        expect(result.current.goalProgress).toBeNull();
    });

    it('should return null goalProgress when sessions is null', () => {
        const book = { readingGoalType: 'WEEKLY', readingGoalPages: 50, currentPage: 20 };
        const { result } = renderHook(() => useBookStatsCalculations(book, null));
        expect(result.current.goalProgress).toBeNull();
    });

    it('should calculate WEEKLY goal progress with pagesRead', () => {
        const now = new Date();
        const book = { readingGoalType: 'WEEKLY', readingGoalPages: 100, currentPage: 60 };
        const sessions = [
            {
                startTime: now.toISOString(),
                endTime: now.toISOString(),
                endPage: 60,
                pagesRead: 60,
            },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.goalProgress).not.toBeNull();
        expect(result.current.goalProgress.current).toBe(60);
        expect(result.current.goalProgress.target).toBe(100);
        expect(result.current.goalProgress.type).toBe('WEEKLY');
        expect(result.current.goalProgress.percent).toBe(60);
        expect(result.current.goalProgress.isGoalReached).toBe(false);
    });

    it('should use fallback calculation when pagesRead is null', () => {
        const now = new Date();
        const book = { readingGoalType: 'MONTHLY', readingGoalPages: 50, currentPage: 30 };
        const sessions = [
            {
                startTime: now.toISOString(),
                endTime: now.toISOString(),
                endPage: 30,
                pagesRead: null,
            },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.goalProgress.current).toBe(30); // 30 - 0 (prev)
    });

    it('should calculate multiplier when goal is reached', () => {
        const now = new Date();
        const book = { readingGoalType: 'WEEKLY', readingGoalPages: 20, currentPage: 100 };
        const sessions = [
            { startTime: now.toISOString(), endTime: now.toISOString(), endPage: 100, pagesRead: 100 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.goalProgress.isGoalReached).toBe(true);
        expect(result.current.goalProgress.multiplier).toBe(5); // 100/20
        expect(result.current.goalProgress.percent).toBe(100);
    });

    it('should ignore sessions before the goal period start', () => {
        const now = new Date();
        const oldDate = new Date('2020-01-01T10:00:00Z');
        const book = { readingGoalType: 'MONTHLY', readingGoalPages: 50, currentPage: 80 };
        const sessions = [
            { startTime: oldDate.toISOString(), endTime: oldDate.toISOString(), endPage: 30, pagesRead: 30 },
            { startTime: now.toISOString(), endTime: now.toISOString(), endPage: 80, pagesRead: 50 },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        expect(result.current.goalProgress.current).toBe(50); // only the recent session
    });

    it('should skip negative added pages', () => {
        const now = new Date();
        const book = { readingGoalType: 'WEEKLY', readingGoalPages: 50, currentPage: 20 };
        const sessions = [
            { startTime: now.toISOString(), endTime: now.toISOString(), endPage: 10, pagesRead: null },
            { startTime: now.toISOString(), endTime: now.toISOString(), endPage: 5, pagesRead: null },
        ];

        const { result } = renderHook(() => useBookStatsCalculations(book, sessions));
        // First: 10-0=10, Second: 5-10=-5 (skipped)
        expect(result.current.goalProgress.current).toBe(10);
    });
});

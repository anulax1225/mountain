import { describe, it, expect } from 'vitest';
import { useDateTime } from '../useDateTime';

describe('useDateTime', () => {
    const {
        formatDate,
        formatTime,
        formatDateTime,
        relativeTime,
        relativeTimeShort,
        isToday,
        isYesterday,
        isTomorrow,
        parseDate,
        addDays,
        diffInDays,
    } = useDateTime();

    describe('formatDate', () => {
        it('returns a non-empty string for a valid date', () => {
            const result = formatDate(new Date('2024-06-15'));
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        it('returns empty string for null', () => {
            expect(formatDate(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(formatDate(undefined)).toBe('');
        });

        it('returns empty string for invalid date', () => {
            expect(formatDate('not-a-date')).toBe('');
        });
    });

    describe('formatTime', () => {
        it('returns a non-empty string for a valid date', () => {
            const result = formatTime(new Date('2024-06-15T14:30:00'));
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        it('returns empty string for null', () => {
            expect(formatTime(null)).toBe('');
        });
    });

    describe('formatDateTime', () => {
        it('returns a non-empty string for a valid date', () => {
            const result = formatDateTime(new Date('2024-06-15T14:30:00'));
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        it('returns empty string for null', () => {
            expect(formatDateTime(null)).toBe('');
        });
    });

    describe('relativeTime', () => {
        it('returns "a l\'instant" for a date just now', () => {
            const result = relativeTime(new Date());
            expect(result).toContain('instant');
        });

        it('returns "il y a" for a past date', () => {
            const pastDate = new Date(Date.now() - 3600 * 1000);
            const result = relativeTime(pastDate);
            expect(result).toContain('il y a');
        });

        it('returns "dans" for a future date', () => {
            const futureDate = new Date(Date.now() + 3600 * 1000);
            const result = relativeTime(futureDate);
            expect(result).toContain('dans');
        });

        it('returns empty string for null', () => {
            expect(relativeTime(null)).toBe('');
        });
    });

    describe('relativeTimeShort', () => {
        it('returns "maintenant" for just now', () => {
            const result = relativeTimeShort(new Date());
            expect(result).toBe('maintenant');
        });

        it('returns minutes format for a few minutes ago', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const result = relativeTimeShort(fiveMinutesAgo);
            expect(result).toBe('5m');
        });

        it('returns hours format for a few hours ago', () => {
            const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
            const result = relativeTimeShort(threeHoursAgo);
            expect(result).toBe('3h');
        });

        it('returns days format for a few days ago', () => {
            const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
            const result = relativeTimeShort(twoDaysAgo);
            expect(result).toBe('2j');
        });

        it('returns empty string for null', () => {
            expect(relativeTimeShort(null)).toBe('');
        });
    });

    describe('isToday', () => {
        it('returns true for today', () => {
            expect(isToday(new Date())).toBe(true);
        });

        it('returns false for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(isToday(yesterday)).toBe(false);
        });
    });

    describe('isYesterday', () => {
        it('returns true for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(isYesterday(yesterday)).toBe(true);
        });

        it('returns false for today', () => {
            expect(isYesterday(new Date())).toBe(false);
        });
    });

    describe('isTomorrow', () => {
        it('returns true for tomorrow', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(isTomorrow(tomorrow)).toBe(true);
        });

        it('returns false for today', () => {
            expect(isTomorrow(new Date())).toBe(false);
        });
    });

    describe('parseDate', () => {
        it('returns a Date object for a valid string', () => {
            const result = parseDate('2024-06-15');
            expect(result).toBeInstanceOf(Date);
            expect(result.getFullYear()).toBe(2024);
        });

        it('returns null for an invalid string', () => {
            expect(parseDate('not-a-date')).toBeNull();
        });

        it('returns null for null', () => {
            expect(parseDate(null)).toBeNull();
        });

        it('returns null for undefined', () => {
            expect(parseDate(undefined)).toBeNull();
        });
    });

    describe('addDays', () => {
        it('adds days correctly', () => {
            const date = new Date('2024-01-01');
            const result = addDays(date, 5);
            expect(result.getDate()).toBe(6);
        });

        it('handles negative days', () => {
            const date = new Date('2024-01-10');
            const result = addDays(date, -3);
            expect(result.getDate()).toBe(7);
        });
    });

    describe('diffInDays', () => {
        it('calculates difference correctly', () => {
            const date1 = new Date('2024-01-01');
            const date2 = new Date('2024-01-11');
            expect(diffInDays(date1, date2)).toBe(10);
        });

        it('returns absolute difference regardless of order', () => {
            const date1 = new Date('2024-01-11');
            const date2 = new Date('2024-01-01');
            expect(diffInDays(date1, date2)).toBe(10);
        });
    });
});

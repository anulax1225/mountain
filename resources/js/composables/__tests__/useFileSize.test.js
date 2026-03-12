import { describe, it, expect } from 'vitest';
import { useFileSize } from '../useFileSize';

describe('useFileSize', () => {
    const {
        formatBytes,
        formatBytesShort,
        parseFileSize,
        getFileSizeCategory,
        sumFileSizes,
        formatSpeed,
        formatDownloadTime,
    } = useFileSize();

    describe('formatBytes', () => {
        it('returns "0 octets" for 0', () => {
            expect(formatBytes(0)).toBe('0 octets');
        });

        it('returns "1 Ko" for 1024', () => {
            expect(formatBytes(1024)).toBe('1 Ko');
        });

        it('returns "1 Mo" for 1048576', () => {
            expect(formatBytes(1048576)).toBe('1 Mo');
        });

        it('returns "0 octets" for null', () => {
            expect(formatBytes(null)).toBe('0 octets');
        });
    });

    describe('formatBytesShort', () => {
        it('returns "1K" for 1024', () => {
            expect(formatBytesShort(1024)).toBe('1K');
        });

        it('returns "0B" for 0', () => {
            expect(formatBytesShort(0)).toBe('0B');
        });
    });

    describe('parseFileSize', () => {
        it('parses "1 MB" to 1048576', () => {
            expect(parseFileSize('1 MB')).toBe(1048576);
        });

        it('parses "1 KB" to 1024', () => {
            expect(parseFileSize('1 KB')).toBe(1024);
        });

        it('parses "1 GB" to correct value', () => {
            expect(parseFileSize('1 GB')).toBe(1024 * 1024 * 1024);
        });

        it('parses "100 octets" to 100', () => {
            expect(parseFileSize('100 octets')).toBe(100);
        });

        it('returns 0 for null', () => {
            expect(parseFileSize(null)).toBe(0);
        });

        it('returns 0 for invalid string', () => {
            expect(parseFileSize('abc')).toBe(0);
        });

        it('returns 0 for French-style "1 Mo" (regex does not match)', () => {
            expect(parseFileSize('1 Mo')).toBe(0);
        });
    });

    describe('getFileSizeCategory', () => {
        it('returns "tiny" for 500 bytes', () => {
            expect(getFileSizeCategory(500)).toBe('tiny');
        });

        it('returns "medium" for 1048576 bytes (1 MB)', () => {
            expect(getFileSizeCategory(1048576)).toBe('medium');
        });

        it('returns "empty" for 0', () => {
            expect(getFileSizeCategory(0)).toBe('empty');
        });

        it('returns "small" for 10000 bytes', () => {
            expect(getFileSizeCategory(10000)).toBe('small');
        });

        it('returns "large" for 50 MB', () => {
            expect(getFileSizeCategory(50 * 1024 * 1024)).toBe('large');
        });

        it('returns "huge" for 200 MB', () => {
            expect(getFileSizeCategory(200 * 1024 * 1024)).toBe('huge');
        });
    });

    describe('sumFileSizes', () => {
        it('sums an array of sizes', () => {
            expect(sumFileSizes([100, 200, 300])).toBe(600);
        });

        it('returns 0 for empty array', () => {
            expect(sumFileSizes([])).toBe(0);
        });
    });

    describe('formatSpeed', () => {
        it('returns "1 Ko/s" for 1024', () => {
            expect(formatSpeed(1024)).toBe('1 Ko/s');
        });

        it('returns "0 octets/s" for 0', () => {
            expect(formatSpeed(0)).toBe('0 octets/s');
        });
    });

    describe('formatDownloadTime', () => {
        it('returns "65s" for 65 seconds (under 60 is seconds only)', () => {
            expect(formatDownloadTime(30)).toBe('30s');
        });

        it('returns "1m 5s" for 65 seconds', () => {
            expect(formatDownloadTime(65)).toBe('1m 5s');
        });

        it('returns "1h 1m" for 3660 seconds', () => {
            expect(formatDownloadTime(3660)).toBe('1h 1m');
        });

        it('returns "1h 1m" for 3700 seconds', () => {
            expect(formatDownloadTime(3700)).toBe('1h 1m');
        });

        it('returns "1h" for exactly 3600 seconds', () => {
            expect(formatDownloadTime(3600)).toBe('1h');
        });
    });
});

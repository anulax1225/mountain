import { describe, it, expect } from 'vitest';
import { useImagePath } from '../useImagePath';

describe('useImagePath', () => {
    const { getImageUrl, isValidImageUrl, getImagePreview } = useImagePath();

    describe('getImageUrl', () => {
        it('returns correct URL for a slug', () => {
            const result = getImageUrl('my-image-slug');
            expect(result).toBe('http://localhost/images/my-image-slug/download');
        });

        it('returns null for null slug', () => {
            expect(getImageUrl(null)).toBeNull();
        });

        it('returns null for empty string slug', () => {
            expect(getImageUrl('')).toBeNull();
        });

        it('returns full URL as-is if starts with http', () => {
            const url = 'https://example.com/image.jpg';
            expect(getImageUrl(url)).toBe(url);
        });

        it('returns full URL as-is if starts with http://', () => {
            const url = 'http://example.com/image.jpg';
            expect(getImageUrl(url)).toBe(url);
        });

        it('strips leading slash from slug', () => {
            const result = getImageUrl('/my-slug');
            expect(result).toBe('http://localhost/images/my-slug/download');
        });
    });

    describe('isValidImageUrl', () => {
        it('returns true for .jpg', () => {
            expect(isValidImageUrl('photo.jpg')).toBe(true);
        });

        it('returns true for .png', () => {
            expect(isValidImageUrl('photo.png')).toBe(true);
        });

        it('returns true for .webp', () => {
            expect(isValidImageUrl('photo.webp')).toBe(true);
        });

        it('returns true for .jpeg', () => {
            expect(isValidImageUrl('photo.jpeg')).toBe(true);
        });

        it('returns true for .gif', () => {
            expect(isValidImageUrl('photo.gif')).toBe(true);
        });

        it('returns false for .txt', () => {
            expect(isValidImageUrl('file.txt')).toBe(false);
        });

        it('returns false for null', () => {
            expect(isValidImageUrl(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(isValidImageUrl(undefined)).toBe(false);
        });
    });

    describe('getImagePreview', () => {
        it('uses thumbnail_path if available', () => {
            const image = { slug: 'main-slug', thumbnail_path: 'thumb-slug' };
            const result = getImagePreview(image);
            expect(result).toBe('http://localhost/images/thumb-slug/download');
        });

        it('falls back to slug when no thumbnail_path', () => {
            const image = { slug: 'main-slug' };
            const result = getImagePreview(image);
            expect(result).toBe('http://localhost/images/main-slug/download');
        });

        it('returns null for null image', () => {
            expect(getImagePreview(null)).toBeNull();
        });
    });
});

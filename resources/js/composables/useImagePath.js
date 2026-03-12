import { computed } from 'vue';

export function useImagePath() {
    const getImageUrl = (imageSlug) => {
        if (!imageSlug) return null;
        
        // If already a full URL, return as-is
        if (imageSlug.startsWith('http://') || imageSlug.startsWith('https://')) {
            return imageSlug;
        }
        
        // Remove leading slash if present
        const cleanPath = imageSlug.startsWith('/') ? imageSlug.slice(1) : imageSlug;
        
        // Construct full URL
        return `${window.location.origin}/images/${cleanPath}/download`;
    };

    const getThumbnailUrl = (imagePath, size = 'medium') => {
        if (!imagePath) return null;
        
        const fullUrl = getImageUrl(imagePath);
        if (!fullUrl) return null;
        
        // Insert size parameter before extension
        const lastDot = fullUrl.lastIndexOf('.');
        if (lastDot === -1) return fullUrl;
        
        return `${fullUrl.slice(0, lastDot)}_${size}${fullUrl.slice(lastDot)}`;
    };

    const getImagePreview = (image) => {
        if (!image) return null;

        if (image.preview_path) {
            const cleanSlug = image.slug.startsWith('/') ? image.slug.slice(1) : image.slug;
            return `${window.location.origin}/images/${cleanSlug}/preview`;
        }

        return getImageUrl(image.slug);
    };

    const isValidImageUrl = (url) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    return {
        getImageUrl,
        getThumbnailUrl,
        getImagePreview,
        isValidImageUrl
    };
}

import { computed } from 'vue';

export function useImagePath() {
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If already a full URL, return as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Remove leading slash if present
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        
        // Construct full URL
        return `${window.location.origin}/storage/${cleanPath}`;
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
        
        // Try thumbnail first, fallback to full image
        return image.thumbnail_path 
            ? getImageUrl(image.thumbnail_path)
            : getImageUrl(image.path);
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

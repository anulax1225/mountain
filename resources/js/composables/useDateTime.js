import { computed } from 'vue';

export function useDateTime(locale = 'fr-FR') {
    const formatDate = (date, options = {}) => {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    };

    const formatTime = (date, options = {}) => {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    };

    const formatDateTime = (date, options = {}) => {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    };

    const relativeTime = (date) => {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);

        // Future dates
        if (diffInSeconds < 0) {
            const absDiff = Math.abs(diffInSeconds);

            if (absDiff < 60) return 'dans quelques secondes';
            if (absDiff < 3600) {
                const minutes = Math.floor(absDiff / 60);
                return `dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
            if (absDiff < 86400) {
                const hours = Math.floor(absDiff / 3600);
                return `dans ${hours} heure${hours > 1 ? 's' : ''}`;
            }
            const days = Math.floor(absDiff / 86400);
            return `dans ${days} jour${days > 1 ? 's' : ''}`;
        }

        // Past dates
        if (diffInSeconds < 10) return 'à l\'instant';
        if (diffInSeconds < 60) return 'il y a quelques secondes';
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 2592000) {
            const weeks = Math.floor(diffInSeconds / 604800);
            return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `il y a ${months} mois`;
        }
        const years = Math.floor(diffInSeconds / 31536000);
        return `il y a ${years} an${years > 1 ? 's' : ''}`;
    };

    const relativeTimeShort = (date) => {
        if (!date) return '';

        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);

        // Past dates only (simplified)
        if (diffInSeconds < 60) return 'maintenant';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}j`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}sem`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mois`;
        return `${Math.floor(diffInSeconds / 31536000)}ans`;
    };

    const formatShortDate = (date) => {
        if (!date) return '';

        return formatDate(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatLongDate = (date) => {
        if (!date) return '';

        return formatDate(date, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatNumericDate = (date) => {
        if (!date) return '';

        return formatDate(date, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const isToday = (date) => {
        if (!date) return false;

        const dateObj = date instanceof Date ? date : new Date(date);
        const today = new Date();

        return dateObj.toDateString() === today.toDateString();
    };

    const isYesterday = (date) => {
        if (!date) return false;

        const dateObj = date instanceof Date ? date : new Date(date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return dateObj.toDateString() === yesterday.toDateString();
    };

    const isTomorrow = (date) => {
        if (!date) return false;

        const dateObj = date instanceof Date ? date : new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return dateObj.toDateString() === tomorrow.toDateString();
    };

    const formatSmartDate = (date) => {
        if (!date) return '';

        if (isToday(date)) {
            return `Aujourd'hui à ${formatTime(date)}`;
        }

        if (isYesterday(date)) {
            return `Hier à ${formatTime(date)}`;
        }

        if (isTomorrow(date)) {
            return `Demain à ${formatTime(date)}`;
        }

        // Check if within the last week
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffInDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));

        if (diffInDays < 7 && diffInDays > 0) {
            return formatDate(date, { weekday: 'long' }) + ` à ${formatTime(date)}`;
        }

        // Otherwise show full date
        return formatDateTime(date);
    };

    const parseDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    const addDays = (date, days) => {
        const result = date instanceof Date ? new Date(date) : new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const addMonths = (date, months) => {
        const result = date instanceof Date ? new Date(date) : new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    };

    const addYears = (date, years) => {
        const result = date instanceof Date ? new Date(date) : new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    };

    const diffInDays = (date1, date2) => {
        const d1 = date1 instanceof Date ? date1 : new Date(date1);
        const d2 = date2 instanceof Date ? date2 : new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return {
        formatDate,
        formatTime,
        formatDateTime,
        formatShortDate,
        formatLongDate,
        formatNumericDate,
        formatSmartDate,
        relativeTime,
        relativeTimeShort,
        isToday,
        isYesterday,
        isTomorrow,
        parseDate,
        addDays,
        addMonths,
        addYears,
        diffInDays
    };
}

import i18n from '../i18n';

export function formatPublishedDate(publishedDate, locale) {
    if (!publishedDate) return null;
    if (publishedDate.length === 4) return publishedDate; // Year only
    const date = new Date(publishedDate);
    if (Number.isNaN(date.getTime())) return publishedDate;
    const resolvedLocale = locale || i18n.language || 'en';
    return new Intl.DateTimeFormat(resolvedLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

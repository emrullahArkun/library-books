export function formatPublishedDate(publishedDate, locale = 'de-DE') {
    if (!publishedDate) return null;
    if (publishedDate.length === 4) return publishedDate; // Year only
    const date = new Date(publishedDate);
    if (Number.isNaN(date.getTime())) return publishedDate;
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export const getHighResImage = (url) => {
    if (!url) return '';
    return url.replace('http:', 'https:')
        .replace('&edge=curl', '');
};

export const mapGoogleBookToNewBook = (volumeInfo, isbnInfo, id) => {
    const uniqueId = isbnInfo ? isbnInfo.identifier : `ID:${id}`;
    const coverUrl = getHighResImage(volumeInfo.imageLinks?.thumbnail);

    return {
        title: volumeInfo.title,
        isbn: uniqueId,
        authorName: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
        publishDate: volumeInfo.publishedDate || 'Unknown Date',
        coverUrl: coverUrl,
        pageCount: volumeInfo.pageCount || 0
    };
};

export const getHighResImage = (url) => {
    if (!url) return '';
    let newUrl = url.replace('http:', 'https:');
    newUrl = newUrl.replace('&zoom=1', '&zoom=0');
    // Remove edge=curl if present for cleaner flat images
    newUrl = newUrl.replace('&edge=curl', '');
    return newUrl;
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
        readingModes: volumeInfo.readingModes,
        pageCount: volumeInfo.pageCount || 0
    };
};

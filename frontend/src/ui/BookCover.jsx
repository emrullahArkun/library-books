import { useState, useEffect, forwardRef } from 'react';
import { Image, Center, Skeleton, Box } from '@chakra-ui/react';
import { FaBookOpen } from 'react-icons/fa';
import { getHighResImage } from '../utils/googleBooks';

const BookCover = forwardRef(({
    book,
    fallbackIcon = FaBookOpen,
    fallbackIconSize = 48,
    objectFit = "cover",
    borderRadius = "md",
    w = "100%",
    h = "100%",
    ...props
}, ref) => {


    // Normalized info access
    // BookSearch uses book.volumeInfo, MyBooks uses top-level fields
    const info = book.volumeInfo || book;
    const initialThumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || info.coverUrl;
    const title = info.title;

    // Determine fallback URL from ISBN immediately
    let fallbackUrl = '';
    const identifiers = info.industryIdentifiers || [];
    let isbn = info.isbn; // MyBooks might have it top-level

    if (!isbn && identifiers.length > 0) {
        const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
        const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
        if (isbn13) isbn = isbn13.identifier;
        else if (isbn10) isbn = isbn10.identifier;
    }

    if (isbn) {
        const cleanIsbn = isbn.replace(/-/g, '');
        if (cleanIsbn.length >= 10) {
            fallbackUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        }
    }

    // Heuristic: If Google says "readingModes.image: false", cover might be placeholder.
    const preferOpenLibrary = (info.readingModes?.image === false) && fallbackUrl;

    const googleUrl = initialThumb ? getHighResImage(initialThumb) : '';
    const safeUrl = preferOpenLibrary
        ? fallbackUrl
        : (googleUrl || fallbackUrl);

    const [imgSrc, setImgSrc] = useState(safeUrl);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset when book changes
    useEffect(() => {
        const newSafeUrl = preferOpenLibrary
            ? fallbackUrl
            : (googleUrl || fallbackUrl);
        setImgSrc(newSafeUrl);
        setImageLoaded(false);
    }, [book, preferOpenLibrary, googleUrl, fallbackUrl]);

    const handleImageError = () => {
        if (imgSrc === fallbackUrl) {
            // Evaluated OL failed.
            if (googleUrl && preferOpenLibrary) {
                // We preferred OL but it failed? Revert to Google.
                setImgSrc(prev => prev === fallbackUrl ? googleUrl : prev);
            }
        } else {
            // Google failed. Try OL.
            if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
            }
        }
        setImageLoaded(true);
    };

    const handleLoad = () => {
        setImageLoaded(true);
    };

    // If we have no source at all after logic
    if (!imgSrc) {
        return (
            <Center
                w={w}
                h={h}
                borderRadius={borderRadius}
                bg="gray.100"
                color="gray.500"
                {...props}
            >
                <Box as={fallbackIcon} size={fallbackIconSize} color="#ccc" />
            </Center>
        );
    }

    return (
        <Skeleton isLoaded={imageLoaded} w={w} h={h} borderRadius={borderRadius}>
            <Image
                ref={ref}
                src={imgSrc}
                onLoad={handleLoad}
                onError={handleImageError}
                alt={title}
                w={w}
                h={h}
                objectFit={objectFit}
                borderRadius={borderRadius}
                fallbackSrc="https://via.placeholder.com/200x300?text=No+Cover"
                {...props}
            />
        </Skeleton>
    );
});

export default BookCover;

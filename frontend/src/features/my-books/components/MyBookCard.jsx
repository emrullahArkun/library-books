import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaChartBar } from 'react-icons/fa';
import { getHighResImage } from '../../../utils/googleBooks';
import {
    Box,
    Image,
    Text,
    Badge,
    Progress,
    Button,
    Checkbox,
    VStack,
    Center,

    Flex
} from '@chakra-ui/react';
import UpdateProgressModal from './UpdateProgressModal';


const MyBookCard = ({
    book,
    isSelected,
    onUpdateProgress,
    onToggleSelect
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // const cardBg = useColorModeValue('white', 'gray.700');
    const hoverTransform = 'translateY(-5px)';

    // Removed inline stop logic as it is now handled in ReadingSessionPage
    /*
        const handleStopClick = () => {
            setStopTime(new Date());
            setFrozenTimerDisplay(timerTime);
            setIsStopModalOpen(true);
        };
    
        const handleStopConfirm = (newPage) => {
            const pagesRead = newPage - (book.currentPage || 0);
            onUpdateProgress(book.id, newPage);
            onStopSession(stopTime, newPage);
            setIsStopModalOpen(false);
            setFrozenTimerDisplay(null);
            if (pagesRead > 0) {
                alert(t('readingSession.pagesReadAlert', { pages: pagesRead }));
            }
        };
    
        const handleStopCancel = () => {
            if (stopTime) {
                const now = new Date();
                const diff = now.getTime() - stopTime.getTime();
                if (diff > 1000 && typeof onExcludeTime === 'function') {
                    try {
                        onExcludeTime(diff);
                    } catch (error) {
                        console.error("Error calling onExcludeTime", error);
                    }
                }
            }
            setIsStopModalOpen(false);
            setFrozenTimerDisplay(null);
            setStopTime(null);
        };
    */

    const handleUpdate = (id, page) => {
        onUpdateProgress(id, page);
        setIsModalOpen(false);
    };

    let fallbackUrl = '';
    // Determine fallback URL from ISBN immediately if needed
    let isbn = book.isbn;
    if (!isbn && book.industryIdentifiers) {
        const identifier = book.industryIdentifiers.find(id => id.type === 'ISBN_13') ||
            book.industryIdentifiers.find(id => id.type === 'ISBN_10');
        if (identifier) {
            isbn = identifier.identifier;
        }
    }

    if (isbn) {
        const cleanIsbn = isbn.replace(/-/g, '');
        if (cleanIsbn.length >= 10) {
            fallbackUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        }
    }



    // Heuristic: If Google says "readingModes.image: false" (passed down via book object), cover might be placeholder.
    // Note: MyBookCard `book` object now has `readingModes` property from `mapGoogleBookToNewBook`.
    const preferOpenLibrary = (book.readingModes?.image === false) && fallbackUrl;

    if (book.title?.includes('Splitter')) {
        console.log('DEBUG MyBookCard Splitter:', {
            id: book.id,
            title: book.title,
            isbn: book.isbn,
            derivedIsbn: isbn,
            readingModes: book.readingModes,
            fallbackUrl,
            preferOpenLibrary
        });
    }

    const safeUrl = preferOpenLibrary
        ? fallbackUrl
        : (book.coverUrl ? getHighResImage(book.coverUrl) : fallbackUrl);

    const [imgSrc, setImgSrc] = useState(safeUrl);

    const handleImageError = () => {
        const googleUrl = book.coverUrl ? getHighResImage(book.coverUrl) : '';

        if (imgSrc === fallbackUrl) {
            // We tried OpenLibrary and it failed.
            if (googleUrl && preferOpenLibrary) {
                // We preferred OpenLibrary but it failed? Revert to Google.
                setImgSrc(prev => prev === fallbackUrl ? googleUrl : prev);
            }
        } else {
            // Google failed. Try OpenLibrary.
            if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
            }
        }
    };

    return (
        <Box
            position="relative"
            transition="transform 0.2s"
            _hover={{ transform: hoverTransform }}
            maxW="240px"
            w="100%"
            m="0 auto"
            className="book-card-detail"
            role="group"
        >
            <Box position="absolute" top="5px" right="5px" zIndex="20">
                <Checkbox
                    isChecked={isSelected}
                    onChange={() => onToggleSelect(book.id)}
                    size="lg"
                    colorScheme="blue"
                    bg="white"
                    rounded="md"
                    aria-label={t('myBooks.markAsRead') || 'Mark as Read'}
                />
            </Box>

            <Box
                h="320px"
                mb="10px"
                position="relative"
                overflow="hidden"
                borderRadius="md"
                boxShadow="md"
            >
                {/* Cover Image */}
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        onError={handleImageError}
                        alt={book.title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        borderRadius="md"
                    />
                ) : (
                    <Center
                        w="100%"
                        h="100%"
                        borderRadius="md"
                        bg="gray.100"
                        color="gray.500"
                    >
                        {t('bookCard.noCover')}
                    </Center>
                )}

                {/* Finished Badge */}
                {book.completed && (
                    <Center
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h="100%"
                        bg="rgba(0, 0, 0, 0.4)"
                        borderRadius="md"
                        alignItems="flex-end"
                        pb="20px"
                    >
                        <Badge
                            bg="white"
                            color="black"
                            fontSize="0.9rem"
                            px="3"
                            py="1"
                            borderRadius="md"
                            boxShadow="base"
                        >
                            {t('bookCard.finished')}
                        </Badge>
                    </Center>
                )}

                {/* Hover Overlay */}
                <Flex
                    position="absolute"
                    inset="0"
                    bg="blackAlpha.600"
                    opacity="0"
                    _groupHover={{ opacity: 1 }}
                    transition="all 0.3s ease"
                    direction="column"
                    justify="space-between"
                    align="center"
                    zIndex="10"
                >
                    {/* Centered Play Button (Start Session) */}
                    <Center
                        flex="1"
                        w="100%"
                        cursor="pointer"
                        role="group"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/books/${book.id}/session`);
                        }}
                    >
                        <VStack
                            spacing={2}
                            as="div"
                            _groupHover={{ transform: "scale(1.1)" }}
                            transition="all 0.2s"
                        >
                            <Box
                                color="white"
                                p={4}
                                borderRadius="full"
                                bg="whiteAlpha.300"
                                _groupHover={{ bg: "whiteAlpha.500" }} // This will now trigger on Center hover as well, which is good.
                                transition="all 0.2s"
                            >
                                <FaPlay size="24px" />
                            </Box>
                            <Text
                                color="white"
                                fontSize="sm"
                                fontWeight="medium"
                                opacity="0"
                                transform="translateY(-10px)"
                                // This text needs to appear when the CARD is hovered (to show the overlay content), 
                                // but maybe we want it to animate differently?
                                // The original code had: _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                                // The original 'group' for THIS element was likely the VStack itself (which had role='group').
                                // Wait, the VStack had role='group' in the original code.
                                // The Text had _groupHover. So it appeared when VStack was hovered.
                                // If the user wants the WHOLE area clickable, maybe the text should be visible whenever the overlay is visible?
                                // OR only when the upper area is hovered?
                                // original: Text appears when hovering the play button (VStack).
                                // New behavior: Text should probably appear when hovering the upper area (Center).
                                // Since Center is now the group, using _groupHover here works perfectly for that.
                                _groupHover={{ opacity: 1, transform: "translateY(0)" }}
                                transition="all 0.3s ease"
                            >
                                {t('readingSession.start', 'Lesen starten')}
                            </Text>
                        </VStack>
                    </Center>

                    {/* Bottom Stats Button */}
                    <Button
                        w="100%"
                        borderRadius="0"
                        variant="solid"
                        bg="var(--navbar-bg)"
                        color="white"
                        _hover={{ bg: "var(--navbar-bg)", filter: "brightness(1.1)" }}
                        leftIcon={<FaChartBar />} // Using FaChartBar, need to import if not present, checking imports...
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/books/${book.id}/stats`);
                        }}
                        size="md"
                        mb={0}
                    >
                        {t('bookCard.stats', 'Statistik')}
                    </Button>
                </Flex>
            </Box>

            <VStack align="stretch" spacing={2}>
                {book.pageCount > 0 ? (
                    <>
                        <Box position="relative" w="100%">
                            <Progress
                                value={((book.currentPage || 0) / book.pageCount) * 100}
                                height="20px"
                                colorScheme="green"
                                borderRadius="full"
                            />
                            <Text
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                fontSize="xs"
                                fontWeight="bold"
                                color="black"
                                w="100%"
                                textAlign="center"
                                zIndex={1}
                            >
                                {t('bookCard.readProgress', { current: book.currentPage || 0, total: book.pageCount })}
                            </Text>
                        </Box>
                        {/* External Start Reading button removed */}
                    </>
                ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center">{t('bookCard.pagesUnknown')}</Text>
                )}
            </VStack>

            {
                isModalOpen && (
                    <UpdateProgressModal
                        book={book}
                        onClose={() => setIsModalOpen(false)}
                        onUpdate={handleUpdate}
                    />
                )
            }


        </Box >
    );
};

export default MyBookCard;

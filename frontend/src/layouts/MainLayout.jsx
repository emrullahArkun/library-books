import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../common/components/Navbar';
import { Box } from '@chakra-ui/react';
import { useReadingSession } from '../features/my-books/hooks/useReadingSession';

import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const isSessionPage = location.pathname.match(/\/books\/\d+\/session/);

    const handleOverlayClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert(t('readingSession.exitWarning', 'Beende erst die Session bevor du verlässt!'));
    };

    const { activeSession } = useReadingSession();
    const navigate = useNavigate();

    // Global Session Alert
    const showSessionAlert = activeSession && !isSessionPage && activeSession.bookId;

    return (
        <>
            <Box position="relative">
                {showSessionAlert && (
                    <Box
                        position="fixed"
                        top="20px"
                        left="50%"
                        transform="translateX(-50%)"
                        zIndex="3000"
                        width="auto"
                    >
                        <Box
                            bg="teal.500"
                            color="white"
                            px={6}
                            py={3}
                            borderRadius="full"
                            boxShadow="lg"
                            display="flex"
                            alignItems="center"
                            gap={3}
                            cursor="pointer"
                            onClick={() => navigate(`/books/${activeSession.bookId}/session`)}
                            _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
                        >
                            <span style={{ fontWeight: 'bold' }}>⚠️ In Session zurückkehren</span>
                        </Box>
                    </Box>
                )}
                <Navbar />
                {isSessionPage && (
                    <Box
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        height="90px"
                        zIndex="2000"
                        cursor="not-allowed"
                        onClick={handleOverlayClick}
                        bg="transparent"
                    />
                )}
            </Box>
            <Outlet />
        </>
    );
};

export default MainLayout;

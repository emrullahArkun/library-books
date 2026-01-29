import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Icon,
    Alert,
    AlertIcon,
    FormControl,
    FormLabel,
    Input,
    Card
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaBookOpen, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const SessionTimerCard = ({
    cardBg,
    brandColor,
    isPaused,
    formattedTime,
    isController,
    takeControl,
    showStopConfirm,
    endPage,
    setEndPage,
    currentPage,
    subTextColor,
    handleConfirmStop,
    handleStopCancel,
    resumeSession,
    pauseSession,
    handleStopClick
}) => {
    const { t } = useTranslation();

    return (
        <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            p={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            backdropFilter="blur(10px)"
        >
            <VStack spacing={8} textAlign="center">
                <FlexHeader brandColor={brandColor} t={t} />

                <Box>
                    <Text
                        fontSize={{ base: "6xl", md: "8xl" }}
                        fontWeight="bold"
                        fontFamily="monospace"
                        color={isPaused ? "gray.500" : "white"}
                        textShadow="0 0 20px rgba(129, 230, 217, 0.3)" // Glow effect
                        lineHeight="1"
                    >
                        {formattedTime}
                    </Text>
                    <Text color={isPaused ? "orange.300" : "teal.300"} mt={2} fontWeight="medium" letterSpacing="wide">
                        {isPaused ? t('readingSession.paused') : t('readingSession.readingPrompt')}
                    </Text>
                </Box>

                {!isController && (
                    <RemoteAlert t={t} takeControl={takeControl} />
                )}

                {showStopConfirm ? (
                    <StopConfirm
                        t={t}
                        subTextColor={subTextColor}
                        endPage={endPage}
                        setEndPage={setEndPage}
                        currentPage={currentPage}
                        handleConfirmStop={handleConfirmStop}
                        handleStopCancel={handleStopCancel}
                    />
                ) : (
                    <Controls
                        t={t}
                        isPaused={isPaused}
                        resumeSession={resumeSession}
                        pauseSession={pauseSession}
                        handleStopClick={handleStopClick}
                        isController={isController}
                    />
                )}
            </VStack>
        </MotionCard>
    );
};

const FlexHeader = ({ brandColor, t }) => (
    <HStack align="center" color={brandColor}>
        <Icon as={FaBookOpen} mr={2} />
        <Text fontWeight="bold" letterSpacing="wider" textTransform="uppercase" fontSize="sm">
            {t('readingSession.activeSession')}
        </Text>
    </HStack>
);

const RemoteAlert = ({ t, takeControl }) => (
    <Alert status="warning" borderRadius="md" variant="solid" bg="orange.500">
        <AlertIcon />
        <Box flex="1">
            <Text fontWeight="bold">{t('readingSession.remote.title')}</Text>
            <Text fontSize="sm">{t('readingSession.remote.desc')}</Text>
        </Box>
        <Button colorScheme="whiteAlpha" size="sm" onClick={takeControl}>
            {t('readingSession.remote.takeControl')}
        </Button>
    </Alert>
);

const StopConfirm = ({ t, subTextColor, endPage, setEndPage, currentPage, handleConfirmStop, handleStopCancel }) => (
    <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        w="full"
        maxW="md"
        bg="whiteAlpha.100"
        p={6}
        borderRadius="xl"
    >
        <VStack spacing={4}>
            <Text color="white" fontWeight="bold" fontSize="lg">{t('readingSession.finish.title')}</Text>
            <FormControl>
                <FormLabel color={subTextColor}>{t('readingSession.finish.endPage')}</FormLabel>
                <Input
                    type="number"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    placeholder={currentPage}
                    bg="whiteAlpha.100"
                    border="none"
                    color="white"
                    _focus={{ bg: "whiteAlpha.200", boxShadow: "none" }}
                />
            </FormControl>
            <HStack spacing={4} w="full">
                <Button flex={1} colorScheme="teal" onClick={handleConfirmStop} leftIcon={<FaCheck />}>
                    {t('readingSession.controls.save')}
                </Button>
                <Button flex={1} variant="ghost" colorScheme="whiteAlpha" onClick={handleStopCancel} color="white">
                    {t('readingSession.controls.cancel')}
                </Button>
            </HStack>
        </VStack>
    </MotionBox>
);

const Controls = ({ t, isPaused, resumeSession, pauseSession, handleStopClick, isController }) => (
    <HStack spacing={6} pt={4}>
        {isPaused ? (
            <Button
                size="lg"
                colorScheme="teal"
                borderRadius="full"
                w="160px"
                h="64px"
                leftIcon={<FaPlay />}
                onClick={resumeSession}
                isDisabled={!isController}
                fontSize="xl"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
                boxShadow="0 0 15px rgba(56, 178, 172, 0.5)"
            >
                {t('readingSession.controls.resume')}
            </Button>
        ) : (
            <Button
                size="lg"
                colorScheme="orange"
                borderRadius="full"
                w="160px"
                h="64px"
                leftIcon={<FaPause />}
                onClick={pauseSession}
                isDisabled={!isController}
                fontSize="xl"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
            >
                {t('readingSession.controls.pause')}
            </Button>
        )}

        <Button
            size="lg"
            variant="outline"
            borderRadius="full"
            w="160px"
            h="64px"
            leftIcon={<FaStop />}
            onClick={handleStopClick}
            isDisabled={!isController}
            color="red.300"
            borderColor="red.300"
            _hover={{ bg: 'red.900', borderColor: 'red.400' }}
            fontSize="xl"
        >
            {t('readingSession.controls.stop')}
        </Button>
    </HStack>
);

export default SessionTimerCard;

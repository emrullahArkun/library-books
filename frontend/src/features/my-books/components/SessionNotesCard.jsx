import {
    Flex,
    Icon,
    Text,
    Textarea,
    Card
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaStickyNote } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const MotionCard = motion(Card);

const SessionNotesCard = ({ note, setNote, cardBg }) => {
    const { t } = useTranslation();

    return (
        <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            p={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            backdropFilter="blur(10px)"
        >
            <Flex align="center" mb={4} color="yellow.200">
                <Icon as={FaStickyNote} mr={2} />
                <Text fontWeight="bold" textTransform="uppercase" fontSize="sm" letterSpacing="wider">{t('readingSession.notes.title')}</Text>
            </Flex>
            <Textarea
                placeholder={t('readingSession.notes.placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                bg="whiteAlpha.100"
                border="none"
                color="white"
                _placeholder={{ color: "gray.500" }}
                _focus={{ bg: "whiteAlpha.200", boxShadow: "none" }}
                resize="none"
                rows={5}
            />
            <Flex justify="flex-end" mt={2}>
                <Text fontSize="xs" color="gray.500">{t('readingSession.notes.helper')}</Text>
            </Flex>
        </MotionCard>
    );
};

export default SessionNotesCard;

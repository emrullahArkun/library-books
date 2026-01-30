import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck, FaTimes } from 'react-icons/fa';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Input,
    Text,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    useToast
} from '@chakra-ui/react';

const StopSessionModal = ({ isOpen, onClose, onConfirm, currentBookPage, maxPages }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [page, setPage] = useState(currentBookPage || 0);

    const handleConfirmFinished = () => {
        setStep(2);
    };

    const handleConfirmPage = () => {
        const pageNum = parseInt(page, 10);
        if (maxPages && pageNum > maxPages) {
            toast({
                title: t('readingSession.stopModal.maxPagesError', { count: maxPages }),
                status: 'error',
                duration: 3000,
                isClosable: true
            });
            return;
        }
        onConfirm(pageNum);
        setStep(1); // Reset for next time
    };

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered motionPreset="slideInBottom">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {step === 1 ? t('readingSession.stopModal.title') : t('readingSession.stopModal.pageTitle')}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {step === 1 && (
                        <Text>{t('readingSession.stopModal.confirm')}</Text> // Using text as confirmation prompt if needed, or just proceed
                    )}

                    {step === 2 && (
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>{t('readingSession.stopModal.pageTitle')}</FormLabel>
                                <Input
                                    type="number"
                                    value={page}
                                    onChange={(e) => setPage(e.target.value)}
                                    min={currentBookPage}
                                    max={maxPages}
                                />
                            </FormControl>
                            {maxPages && (
                                <Text fontSize="sm" color="gray.500">
                                    {t('readingSession.stopModal.maxPagesHint', { count: maxPages })}
                                </Text>
                            )}
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter>
                    {step === 1 ? (
                        <HStack spacing={3}>
                            <Button colorScheme="blue" onClick={handleConfirmFinished} leftIcon={<FaCheck />}>
                                {t('readingSession.stopModal.confirm')}
                            </Button>
                            <Button variant="ghost" onClick={handleClose} leftIcon={<FaTimes />}>
                                {t('readingSession.stopModal.cancel')}
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing={3}>
                            <Button colorScheme="blue" onClick={handleConfirmPage} leftIcon={<FaCheck />}>
                                {t('readingSession.stopModal.submit')}
                            </Button>
                            <Button variant="ghost" onClick={handleClose} leftIcon={<FaTimes />}>
                                {t('readingSession.stopModal.abort')}
                            </Button>
                        </HStack>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StopSessionModal;

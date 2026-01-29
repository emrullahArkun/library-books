import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    FormControl,
    FormLabel,
    RadioGroup,
    Stack,
    Radio,
    Input
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const BookGoalModal = ({
    isOpen,
    onClose,
    goalType,
    setGoalType,
    goalPages,
    setGoalPages,
    handleSaveGoal,
    isSavingGoal
}) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent bg="gray.800" color="white">
                <ModalHeader>{t('bookStats.goal.modal.title', 'Set Reading Goal')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>{t('bookStats.goal.modal.period', 'Goal Period')}</FormLabel>
                            <RadioGroup value={goalType} onChange={setGoalType}>
                                <Stack direction="row" spacing={4}>
                                    <Radio value="WEEKLY" colorScheme="teal">{t('bookStats.goal.modal.weekly', 'Weekly')}</Radio>
                                    <Radio value="MONTHLY" colorScheme="teal">{t('bookStats.goal.modal.monthly', 'Monthly')}</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel>{t('bookStats.goal.modal.pages', 'Number of Pages')}</FormLabel>
                            <Input
                                type="number"
                                value={goalPages}
                                onChange={(e) => setGoalPages(e.target.value)}
                                placeholder="e.g. 50"
                                focusBorderColor="teal.200"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} color="gray.400">{t('bookStats.goal.modal.cancel', 'Cancel')}</Button>
                    <Button colorScheme="teal" onClick={handleSaveGoal} isLoading={isSavingGoal}>
                        {t('bookStats.goal.modal.save', 'Save Goal')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BookGoalModal;

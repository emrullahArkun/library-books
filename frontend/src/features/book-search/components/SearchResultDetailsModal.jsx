import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const SearchResultDetailsModal = ({ isOpen, onClose, title, description }) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent>
                <ModalHeader pr={10}>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Text fontWeight="bold" mb={2}>{t('search.result.description')}:</Text>
                    <Text whiteSpace="pre-wrap">{description}</Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default SearchResultDetailsModal;

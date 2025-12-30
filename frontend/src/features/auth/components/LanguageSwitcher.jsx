import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const isDe = i18n.resolvedLanguage === 'de';

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Flex position="absolute" top={4} right={4} gap={2}>
            <Button
                size="sm"
                variant={!isDe ? "solid" : "ghost"}
                colorScheme="teal"
                onClick={() => changeLanguage('en')}
                opacity={!isDe ? 1 : 0.6}
            >
                EN
            </Button>
            <Button
                size="sm"
                variant={isDe ? "solid" : "ghost"}
                colorScheme="teal"
                onClick={() => changeLanguage('de')}
                opacity={isDe ? 1 : 0.6}
            >
                DE
            </Button>
        </Flex>
    );
}

export default LanguageSwitcher;

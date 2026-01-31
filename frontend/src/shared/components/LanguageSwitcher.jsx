
import { Flex, Button, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ variant = 'default', ...props }) => {
    const { i18n } = useTranslation();
    const isDe = i18n.resolvedLanguage === 'de';

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    if (variant === 'auth') {
        return (
            <Flex gap={2} position="absolute" top={4} right={4} {...props}>
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

    // Default (Navbar style)
    return (
        <Flex align="center" gap={2} ml={4} {...props}>
            <Button
                variant="unstyled"
                size="sm"
                fontWeight={!isDe ? "bold" : "normal"}
                textDecoration={!isDe ? "underline" : "none"}
                color={!isDe ? "white" : "whiteAlpha.700"}
                _hover={{ color: "white" }}
                onClick={() => changeLanguage('en')}
                minW="auto"
                h="auto"
                p={0}
                display="inline-flex"
            >
                EN
            </Button>
            <Text color="whiteAlpha.500" fontSize="sm">|</Text>
            <Button
                variant="unstyled"
                size="sm"
                fontWeight={isDe ? "bold" : "normal"}
                textDecoration={isDe ? "underline" : "none"}
                color={isDe ? "white" : "whiteAlpha.700"}
                _hover={{ color: "white" }}
                onClick={() => changeLanguage('de')}
                minW="auto"
                h="auto"
                p={0}
                display="inline-flex"
            >
                DE
            </Button>
        </Flex>
    );
};

export default LanguageSwitcher;

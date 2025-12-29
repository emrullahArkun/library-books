import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    Link,
    useToast,
    Container,
    InputGroup,
    InputLeftElement,
    Icon,
    Flex
} from '@chakra-ui/react';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function LoginPage() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || '');
    const [password, setPassword] = useState(import.meta.env.VITE_TEST_PASSWORD || '');
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login({ email: data.email, role: data.role }, data.token);
            toast({
                title: t('auth.login.title'),
                description: "Successfully logged in.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
            navigate('/', { replace: true });
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const isDe = i18n.resolvedLanguage === 'de';

    return (
        <Flex
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={20}
            align="flex-start"
            justify="center"
            bgGradient="linear(to-br, teal.50, gray.100)"
            overflow="hidden"
            pt={{ base: "15vh", md: "12vh" }}
        >
            {/* Language Switcher */}
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

            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                w="full"
                maxW="md"
                bg="white"
                p={8}
                borderRadius="xl"
                boxShadow="2xl"
                border="1px"
                borderColor="gray.100"
            >
                <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                    <VStack spacing={2} textAlign="center">
                        <Icon as={MdLogin} w={12} h={12} color="teal.500" />
                        <Heading size="lg" color="gray.700">
                            {t('auth.login.title')}
                        </Heading>
                    </VStack>

                    <VStack spacing={4} w="full">
                        <FormControl isRequired>
                            <FormLabel color="gray.600">{t('auth.email')}</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={MdEmail} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={t('auth.enterEmail')}
                                    focusBorderColor="teal.500"
                                    borderRadius="lg"
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel color="gray.600">{t('auth.password')}</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={MdLock} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t('auth.enterPassword')}
                                    focusBorderColor="teal.500"
                                    borderRadius="lg"
                                />
                            </InputGroup>
                        </FormControl>
                    </VStack>

                    <Button
                        type="submit"
                        colorScheme="teal"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Signing in..."
                        borderRadius="lg"
                        boxShadow="md"
                        _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                    >
                        {t('auth.login.button')}
                    </Button>

                    <Text fontSize="sm" color="gray.600">
                        {t('auth.register.link')} {' '}
                        <Link
                            as={RouterLink}
                            to="/register"
                            color="teal.500"
                            fontWeight="semibold"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            {t('auth.register.button')}
                        </Link>
                    </Text>
                </VStack>
            </MotionBox>
        </Flex>
    );
}

export default LoginPage;

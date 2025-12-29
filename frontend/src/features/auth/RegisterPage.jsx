import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    InputGroup,
    InputLeftElement,
    Icon,
    Flex
} from '@chakra-ui/react';
import { MdEmail, MdLock, MdAppRegistration } from 'react-icons/md';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function RegisterPage() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const isDe = i18n.resolvedLanguage === 'de';

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = t('auth.required');
        if (!password) newErrors.password = t('auth.required');
        if (!confirmPassword) newErrors.confirmPassword = t('auth.required');
        if (password && confirmPassword && password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast({
                title: t('auth.register.title'),
                description: "Registration successful! Please check your server console.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right"
            });
            setTimeout(() => navigate('/login', { replace: true }), 2000);
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
                <VStack spacing={6} as="form" onSubmit={handleSubmit} noValidate>
                    <VStack spacing={2} textAlign="center">
                        <Icon as={MdAppRegistration} w={12} h={12} color="teal.500" />
                        <Heading size="lg" color="gray.700">
                            {t('auth.register.title')}
                        </Heading>
                    </VStack>

                    <VStack spacing={4} w="full">
                        <FormControl isInvalid={!!errors.email} isRequired>
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
                            {/* We use standard HTML5 validation or custom message if needed. 
                                Since user specifically asked for localized messages, we rely on custom validation here.
                                isRequired on FormControl just adds the asterisk. */}
                            {errors.email && <Box color="red.500" fontSize="sm" mt={1}>{errors.email}</Box>}
                        </FormControl>

                        <FormControl isInvalid={!!errors.password} isRequired>
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
                            {errors.password && <Box color="red.500" fontSize="sm" mt={1}>{errors.password}</Box>}
                        </FormControl>

                        <FormControl isInvalid={!!errors.confirmPassword} isRequired>
                            <FormLabel color="gray.600">{t('auth.confirmPassword')}</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={MdLock} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder={t('auth.confirmPassword')}
                                    focusBorderColor="teal.500"
                                    borderRadius="lg"
                                />
                            </InputGroup>
                            {errors.confirmPassword && <Box color="red.500" fontSize="sm" mt={1}>{errors.confirmPassword}</Box>}
                        </FormControl>
                    </VStack>

                    <Button
                        type="submit"
                        colorScheme="teal"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Creating account..."
                        borderRadius="lg"
                        boxShadow="md"
                        _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                    >
                        {t('auth.register.button')}
                    </Button>

                    <Text fontSize="sm" color="gray.600">
                        {t('auth.register.loginLink')} {' '}
                        <Link
                            as={RouterLink}
                            to="/login"
                            color="teal.500"
                            fontWeight="semibold"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            {t('auth.login.button')}
                        </Link>
                    </Text>
                </VStack>
            </MotionBox>
        </Flex>
    );
}

export default RegisterPage;

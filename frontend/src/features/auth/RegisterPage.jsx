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
    Icon
} from '@chakra-ui/react';
import { MdEmail, MdLock, MdAppRegistration } from 'react-icons/md';
import AuthShell from './components/AuthShell';

function RegisterPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = t('auth.required');
        } else if (!email.includes('@')) {
            newErrors.email = t('auth.invalidEmail', 'Invalid email format');
        }

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

            let data = null;
            try { data = await response.json(); } catch { /* ignore */ }

            if (!response.ok) {
                throw new Error(data?.error || 'Registration failed');
            }

            toast({
                title: t('auth.register.title'),
                description: t('auth.register.success', "Registration successful! Please check your email."),
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right",
                containerStyle: {
                    marginTop: "80px"
                }
            });
            // Proceed to login immediately, or stay here? 
            // The user suggested maybe no timeout or handle unmount. 
            // Navigating immediately is cleaner given the toast persists.
            navigate('/login');
        } catch (err) {
            toast({
                title: t('auth.errorTitle', "Error"),
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
        <AuthShell>
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
                                autoComplete="email"
                            />
                        </InputGroup>
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
                                autoComplete="new-password"
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
                                autoComplete="new-password"
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
                    loadingText={t('auth.register.loadingText', "Creating account...")}
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
        </AuthShell>
    );
}

export default RegisterPage;

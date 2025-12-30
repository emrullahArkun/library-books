import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
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
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import AuthShell from './components/AuthShell';

function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || '');
    const [password, setPassword] = useState(import.meta.env.VITE_TEST_PASSWORD || '');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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

            let data = null;
            try { data = await response.json(); } catch { /* ignore */ }

            if (!response.ok) {
                throw new Error(data?.error || 'Login failed');
            }

            login({ email: data.email, role: data.role }, data.token);
            toast({
                title: t('auth.login.title'),
                description: t('auth.login.success', "Successfully logged in."),
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right"
            });
            // Redirect to original route if available, otherwise home
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
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
                                autoComplete="email"
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
                                autoComplete="current-password"
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
                    loadingText={t('auth.login.loadingText', "Signing in...")}
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
        </AuthShell>
    );
}

export default LoginPage;

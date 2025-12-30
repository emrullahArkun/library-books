import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Heading, Text, VStack, Icon, Spinner } from '@chakra-ui/react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import AuthShell from './components/AuthShell';

function VerifyEmailPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage(t('auth.verify.noToken', 'No verification token found.'));
            return;
        }

        const encodedToken = encodeURIComponent(token);

        fetch(`/api/auth/verify?token=${encodedToken}`)
            .then(async res => {
                if (res.ok) {
                    setStatus('success');
                    setMessage(t('auth.verify.success', 'Account verified successfully!'));
                } else {
                    setStatus('error');
                    let text = '';
                    try {
                        // try json first
                        const data = await res.json();
                        text = data.error || data.message;
                    } catch {
                        // fallback to text
                        text = await res.text();
                    }
                    setMessage(text || t('auth.verify.failed', 'Verification failed.'));
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage(t('auth.verify.connectionError', 'Connection error.'));
            });
    }, [token, t]);

    return (
        <AuthShell>
            <VStack spacing={6} textAlign="center">
                <Heading size="lg" color="gray.700">
                    {t('auth.verify.title', 'Email Verification')}
                </Heading>

                {status === 'verifying' && (
                    <VStack spacing={4}>
                        <Spinner size="xl" color="teal.500" thickness="4px" />
                        <Text color="gray.600">{t('auth.verify.verifying', 'Verifying your account...')}</Text>
                    </VStack>
                )}

                {status === 'success' && (
                    <VStack spacing={4}>
                        <Icon as={MdCheckCircle} w={16} h={16} color="green.500" />
                        <Text fontSize="lg" color="gray.700">{message}</Text>
                        <Button
                            as={RouterLink}
                            to="/login"
                            colorScheme="teal"
                            size="lg"
                            w="full"
                        >
                            {t('auth.verify.goToLogin', 'Go to Login')}
                        </Button>
                    </VStack>
                )}

                {status === 'error' && (
                    <VStack spacing={4}>
                        <Icon as={MdError} w={16} h={16} color="red.500" />
                        <Text fontSize="lg" color="red.600">{message}</Text>
                        <Button
                            as={RouterLink}
                            to="/register"
                            variant="outline"
                            colorScheme="teal"
                            size="lg"
                            w="full"
                        >
                            {t('auth.verify.tryRegister', 'Try Registering Again')}
                        </Button>
                    </VStack>
                )}
            </VStack>
        </AuthShell>
    );
}

export default VerifyEmailPage;

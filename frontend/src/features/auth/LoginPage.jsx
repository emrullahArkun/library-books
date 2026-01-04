import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '@chakra-ui/react'; // Keeping toast for now as per plan
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import { api } from '../../api/api';

// New UI Components
import { AuthLayout } from '../../ui/layouts/AuthLayout';
import { TextField } from '../../ui/TextField';
import { Button } from '../../ui/Button';

// Scoped styles for page-specific layout tweaks if needed
// or just inline styles/utility classes. 
// We'll use a small inline style for the link to keep it simple without extra css file
const linkStyle = {
    color: 'var(--primary-base)',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: '0.875rem'
};

function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || '');
    const [password, setPassword] = useState(import.meta.env.VITE_TEST_PASSWORD || '');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.auth.login(email, password);

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
                position: "top-right",
            });
            // Redirect to original route if available, otherwise home
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
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
        <AuthLayout
            title={t('auth.login.title')}
            icon={<MdLogin />}
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextField
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={t('auth.enterEmail')}
                        leftIcon={<MdEmail />}
                        required
                        autoComplete="email"
                    />

                    <TextField
                        label={t('auth.password')}
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={t('auth.enterPassword')}
                        leftIcon={<MdLock />}
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && (
                    <div style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '-8px' }}>
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    style={{ width: '100%' }}
                >
                    {t('auth.login.button')}
                </Button>

                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {t('auth.register.link')}{' '}
                    </span>
                    <RouterLink to="/register" style={linkStyle}>
                        {t('auth.register.button')}
                    </RouterLink>
                </div>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;

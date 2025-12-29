import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Auth.css';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        fetch(`/api/auth/verify?token=${token}`)
            .then(async res => {
                if (res.ok) {
                    setStatus('success');
                    setMessage('Account verified successfully!');
                } else {
                    setStatus('error');
                    const text = await res.text();
                    setMessage(text || 'Verification failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Connection error.');
            });
    }, [searchParams]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Email Verification</h2>
                {status === 'verifying' && <p>Verifying your account...</p>}
                {status === 'success' && (
                    <div className="success-message">
                        {message}
                        <br />
                        <Link to="/login" className="btn-link">Go to Login</Link>
                    </div>
                )}
                {status === 'error' && (
                    <div className="error-message">
                        {message}
                        <br />
                        <Link to="/register">Try Registering Again</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;

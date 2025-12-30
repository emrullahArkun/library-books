import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthGateLoader from './AuthGateLoader';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <AuthGateLoader />;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;


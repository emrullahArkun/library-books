import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthGateLoader from './AuthGateLoader';

const ProtectedRoute = ({ requireAdmin }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <AuthGateLoader />;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;


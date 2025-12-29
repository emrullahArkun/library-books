import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or return null
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />; // Or authorization error page
    }

    return children;
};

export default ProtectedRoute;

import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBook /> Library Books
                </Link>
            </div>
            <div className="navbar-menu">
                <Link to="/" className="navbar-item">Home</Link>
                {user ? (
                    <>
                        <Link to="/my-books" className="navbar-item">My Books</Link>
                        <button onClick={handleLogout} className="navbar-item logout-btn">
                            <FaSignOutAlt /> Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="navbar-item">
                        <FaSignInAlt /> Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

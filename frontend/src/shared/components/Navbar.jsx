import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBook /> {t('navbar.brand')}
                </Link>
            </div>
            <div className="navbar-menu">
                {user ? (
                    <div className="navbar-glass-pane">
                        <Link to="/" className="navbar-item">
                            {location.pathname === '/' && (
                                <motion.div
                                    layoutId="nav-bubble"
                                    className="nav-bubble"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="navbar-text">{t('navbar.search')}</span>
                        </Link>
                        <Link to="/my-books" className="navbar-item">
                            {location.pathname === '/my-books' && (
                                <motion.div
                                    layoutId="nav-bubble"
                                    className="nav-bubble"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="navbar-text">{t('navbar.myBooks')}</span>
                        </Link>
                        <button onClick={handleLogout} className="navbar-item logout-btn">
                            <FaSignOutAlt />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="navbar-item">
                        <FaSignInAlt /> {t('navbar.login')}
                    </Link>
                )}
                <LanguageSwitcher />
            </div>
        </nav>
    );
}

export default Navbar;

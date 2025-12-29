import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
                    <>
                        <Link to="/" className="navbar-item">{t('navbar.search')}</Link>
                        <Link to="/my-books" className="navbar-item">{t('navbar.myBooks')}</Link>
                        <button onClick={handleLogout} className="navbar-item logout-btn">
                            <FaSignOutAlt /> {t('navbar.logout')}
                        </button>
                    </>
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

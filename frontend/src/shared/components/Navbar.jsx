import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import { useAnimation } from '../../context/AnimationContext';
import { useReadingSessionContext } from '../../context/ReadingSessionContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { registerTarget } = useAnimation();
    const { activeSession } = useReadingSessionContext();

    // Check if we are on a statistics page
    const isStatsPage = location.pathname.match(/\/books\/\d+\/stats/);
    const isSessionPage = location.pathname.match(/\/books\/\d+\/session/);

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
                        <Link to="/my-books" className="navbar-item" ref={registerTarget}>
                            {location.pathname === '/my-books' && (
                                <motion.div
                                    layoutId="nav-bubble"
                                    className="nav-bubble"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="navbar-text">{t('navbar.myBooks')}</span>
                        </Link>

                        <AnimatePresence>
                            {/* Dynamic Item: Reading Session (Active) */}
                            {activeSession && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0, overflow: 'hidden' }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    style={{ display: 'flex' }}
                                >
                                    <Link to={`/books/${activeSession.bookId}/session`} className="navbar-item">
                                        {(location.pathname === `/books/${activeSession.bookId}/session`) && (
                                            <motion.div
                                                layoutId="nav-bubble"
                                                className="nav-bubble"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="navbar-text">{t('navbar.session')}</span>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Dynamic Item: Statistics (On Stats Page) */}
                            {(isStatsPage && !isSessionPage) && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0, overflow: 'hidden' }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    style={{ display: 'flex' }}
                                >
                                    <Link to={location.pathname} className="navbar-item">
                                        <motion.div
                                            layoutId="nav-bubble"
                                            className="nav-bubble"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                        <span className="navbar-text">{t('navbar.stats')}</span>
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>

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

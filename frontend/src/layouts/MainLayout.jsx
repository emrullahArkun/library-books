import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../shared/components/Navbar';
import { useReadingSession } from '../features/my-books/hooks/useReadingSession';

import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const isSessionPage = location.pathname.match(/\/books\/\d+\/session/);

    const handleOverlayClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        alert(t('readingSession.exitWarning', 'Beende erst die Session bevor du verlässt!'));
    };

    const { activeSession } = useReadingSession();
    const navigate = useNavigate();

    // Global Session Alert
    const showSessionAlert = activeSession && !isSessionPage && activeSession.bookId;

    return (
        <>
            <div style={{ position: 'relative' }}>
                {showSessionAlert && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 3000,
                            width: 'auto'
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#319795', // Teal 500
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '9999px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onClick={() => navigate(`/books/${activeSession.bookId}/session`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontWeight: 'bold' }}>⚠️ In Session zurückkehren</span>
                        </div>
                    </div>
                )}
                <Navbar />
                {isSessionPage && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '90px',
                            zIndex: 2000,
                            cursor: 'not-allowed',
                            backgroundColor: 'transparent'
                        }}
                        onClick={handleOverlayClick}
                    />
                )}
            </div>
            <div className="main-layout-content">
                <Outlet />
            </div>
        </>
    );
};

export default MainLayout;

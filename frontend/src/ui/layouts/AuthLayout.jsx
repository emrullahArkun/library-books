import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next'; // Added useTranslation
import { MdLibraryBooks, MdTimer, MdShowChart, MdStar } from 'react-icons/md';
import { StringLights } from '../StringLights';
import { Card } from '../Card';
import LanguageSwitcher from '../../shared/components/LanguageSwitcher';
import './AuthLayout.css';

export const AuthLayout = ({ children, title, icon }) => {
    const { t } = useTranslation();
    // Generate random stars for the background
    const stars = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 1.5 + 0.5}rem`, // 0.5rem to 2rem
            opacity: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
            rotation: `${Math.random() * 360}deg`,
        }));
    }, []);

    return (
        <div className="auth-layout">
            <div className="auth-layout__language-switcher">
                <LanguageSwitcher />
            </div>

            {/* Brand Panel (Desktop Only) */}
            <div className="auth-layout__brand">
                {/* Background Stars */}
                {stars.map((star) => (
                    <MdStar
                        key={star.id}
                        style={{
                            position: 'absolute',
                            top: star.top,
                            left: star.left,
                            fontSize: star.size,
                            opacity: star.opacity,
                            transform: `rotate(${star.rotation})`,
                            color: 'var(--accent-200)', // Using a light accent color for stars
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                ))}

                <StringLights />
                <div className="auth-layout__brand-content">
                    <div className="auth-layout__logo-large">
                        <MdLibraryBooks style={{ fontSize: '3rem' }} />
                        <h1>{t('auth.brand.appName')}</h1>
                    </div>
                    <p className="auth-layout__tagline">
                        {t('auth.brand.tagline')}
                    </p>
                    <ul className="auth-layout__features">
                        <li><MdLibraryBooks className="auth-layout__feature-icon" /> {t('auth.brand.features.track')}</li>
                        <li><MdTimer className="auth-layout__feature-icon" /> {t('auth.brand.features.time')}</li>
                        <li><MdShowChart className="auth-layout__feature-icon" /> {t('auth.brand.features.visualize')}</li>
                    </ul>
                </div>
            </div>

            {/* Form Area */}
            <div className="auth-layout__form-area">
                <Card className="auth-layout__card">
                    <div className="auth-layout__header">
                        {icon && <span className="auth-layout__mobile-icon">{icon}</span>}
                        <h2 className="auth-layout__title">{title}</h2>
                    </div>
                    {children}
                </Card>
            </div>
        </div>
    );
};

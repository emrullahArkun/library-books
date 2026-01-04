import React, { useMemo } from 'react';
import { MdLibraryBooks, MdTimer, MdShowChart, MdStar } from 'react-icons/md';
import { StringLights } from '../StringLights';
import { Card } from '../Card';
import './AuthLayout.css';

export const AuthLayout = ({ children, title, icon }) => {
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
                        <h1>MiniLibrary</h1>
                    </div>
                    <p className="auth-layout__tagline">
                        Your personal cozy reading space.
                    </p>
                    <ul className="auth-layout__features">
                        <li><MdLibraryBooks className="auth-layout__feature-icon" /> Track your library</li>
                        <li><MdTimer className="auth-layout__feature-icon" /> Time your sessions</li>
                        <li><MdShowChart className="auth-layout__feature-icon" /> Visualize progress</li>
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

import React from 'react';
import { MdLibraryBooks, MdTimer, MdShowChart } from 'react-icons/md';
import { StringLights } from '../StringLights';
import { Card } from '../Card';
import './AuthLayout.css';

export const AuthLayout = ({ children, title, icon }) => {
    return (
        <div className="auth-layout">
            {/* Brand Panel (Desktop Only) */}
            <div className="auth-layout__brand">
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

import React, { useEffect } from 'react';
import TypewriterTitle from '../shared/components/TypewriterTitle';
import BookSearch from '../features/book-search/BookSearch';
import styles from './HomePage.module.css';

const HomePage = () => {
    useEffect(() => {
        document.body.style.backgroundColor = 'var(--accent-800)';
        document.body.style.backgroundImage = `repeating-linear-gradient(
            to right,
            transparent,
            transparent 39px,
            rgba(0, 0, 0, 0.1) 40px,
            rgba(0, 0, 0, 0.1) 41px
        )`;

        return () => {
            document.body.style.backgroundColor = 'var(--bg-app)';
            document.body.style.backgroundImage = 'none';
        };
    }, []);

    return (
        <div className={styles.homeContent}>
            <TypewriterTitle />
            <BookSearch />
        </div>
    );
};

export default HomePage;

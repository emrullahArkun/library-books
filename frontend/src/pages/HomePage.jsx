import React, { useEffect } from 'react';
import TypewriterTitle from '../shared/components/TypewriterTitle';
import BookSearch from '../features/book-search/BookSearch';
import styles from './HomePage.module.css';

const HomePage = () => {
    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';
        return () => {
            document.body.style.backgroundColor = 'var(--bg-app)';
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

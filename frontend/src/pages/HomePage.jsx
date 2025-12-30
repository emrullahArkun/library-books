import React from 'react';
import TypewriterTitle from '../components/TypewriterTitle';
import BookSearch from '../features/book-search/BookSearch';

const HomePage = () => {
    return (
        <div className="home-content">
            <TypewriterTitle />
            <BookSearch />
        </div>
    );
};

export default HomePage;

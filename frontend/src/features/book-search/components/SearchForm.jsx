import React from 'react';
import { FaSearch } from 'react-icons/fa';
import '../BookSearch.css'; // Reusing existing styles for now or move specific ones

const SearchForm = ({ query, setQuery, onSearch }) => {
    return (
        <form onSubmit={onSearch} className="search-form">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, isbn..."
                className="search-input"
            />
            <button type="submit" className="search-button">
                <FaSearch />
                Suchen
            </button>
        </form>
    );
};

export default SearchForm;

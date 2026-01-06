import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../BookSearch.css'; // Reusing existing styles for now or move specific ones

const SearchForm = ({ query, setQuery, onSearch }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={onSearch} className="search-form">
            <FaSearch className="search-icon" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder', 'Suche nach Titel, Autor, ISBN...')}
                className="search-input"
            />
        </form>
    );
};

export default SearchForm;

import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../BookSearch.css'; // Reusing existing styles for now or move specific ones

const SearchForm = ({ query, setQuery, onSearch }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={onSearch} className="search-form">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="search-input"
            />
            <button type="submit" className="search-button">
                <FaSearch />
                {t('search.button')}
            </button>
        </form>
    );
};

export default SearchForm;

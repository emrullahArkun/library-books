import React from 'react';
import { FaBookOpen, FaFileAlt, FaTag, FaStar } from 'react-icons/fa';
import '../BookSearch.css';

const SearchResultCard = ({ book, onAdd }) => {
    const info = book.volumeInfo;

    return (
        <div className="search-result-card">
            <div className="card-header">
                <div className="result-img-wrapper">
                    {info.imageLinks?.thumbnail ? (
                        <img src={info.imageLinks.thumbnail} alt="" className="result-thumb" />
                    ) : (
                        <div className="result-thumb-placeholder"><FaBookOpen size={24} color="#ccc" /></div>
                    )}
                </div>
                <div className="card-basic-info">
                    <div className="book-title">{info.title}</div>
                    <div className="author">by {info.authors?.join(', ') || 'Unknown'}</div>
                    {info.publishedDate && <div className="meta-date">{info.publishedDate}</div>}
                    {info.publisher && <div className="meta-publisher">{info.publisher}</div>}
                </div>
            </div>

            <div className="card-details">
                {info.description && (
                    <p className="description" title={info.description}>
                        {info.description.length > 150
                            ? info.description.substring(0, 150) + '...'
                            : info.description}
                    </p>
                )}
                <div className="meta-row">
                    {info.pageCount && <span className="tag"><FaFileAlt /> {info.pageCount} p.</span>}
                    {info.categories && (
                        <span className="tag">
                            <FaTag />
                            {info.categories[0]}
                        </span>
                    )}
                    {info.averageRating && <span className="tag"><FaStar color="#FFC107" /> {info.averageRating}</span>}
                </div>
            </div>

            <button onClick={() => onAdd(book)} className="add-button">
                Add to Library
            </button>
        </div>
    );
};

export default SearchResultCard;

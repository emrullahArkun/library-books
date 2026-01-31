import { FaSearch, FaExclamationCircle, FaBookOpen } from 'react-icons/fa';
import { usePinstripeBackground } from '../../hooks/usePinstripeBackground';
import DiscoverySection from './components/DiscoverySection';
import useDiscovery from './hooks/useDiscovery';
import styles from './DiscoveryPage.module.css';

/**
 * Discovery page showing personalized book recommendations
 */
const DiscoveryPage = () => {
    usePinstripeBackground();
    const { loading, error, data, refresh } = useDiscovery();

    if (loading) {
        return (
            <div className={styles.discoveryPage}>
                <div className={styles.header}>
                    <h1 className={styles.title}><FaSearch className={styles.titleIcon} /> Entdecken</h1>
                    <p className={styles.subtitle}>Personalisierte Buchempfehlungen basierend auf deiner Bibliothek</p>
                </div>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Empfehlungen werden geladen...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.discoveryPage}>
                <div className={styles.header}>
                    <h1 className={styles.title}><FaSearch className={styles.titleIcon} /> Entdecken</h1>
                    <p className={styles.subtitle}>Personalisierte Buchempfehlungen basierend auf deiner Bibliothek</p>
                </div>
                <div className={styles.errorState}>
                    <p><FaExclamationCircle /> {error}</p>
                    <button className={styles.refreshBtn} onClick={refresh}>
                        Erneut versuchen
                    </button>
                </div>
            </div>
        );
    }

    const hasAuthors = data.byAuthor?.authors?.length > 0;
    const hasCategories = data.byCategory?.categories?.length > 0;
    const hasSearches = data.bySearch?.queries?.length > 0;
    const hasAnyData = hasAuthors || hasCategories || hasSearches;

    return (
        <div className={styles.discoveryPage}>
            <div className={styles.header}>
                <h1 className={styles.title}><FaSearch className={styles.titleIcon} /> Entdecken</h1>
                <p className={styles.subtitle}>
                    {hasAnyData
                        ? 'Personalisierte Buchempfehlungen basierend auf deiner Bibliothek'
                        : 'Füge Bücher hinzu, um personalisierte Empfehlungen zu erhalten'}
                </p>
            </div>

            <div className={styles.sections}>
                {hasAuthors && (
                    <DiscoverySection
                        title="Mehr von deinen Lieblingsautoren"
                        subtitle={data.byAuthor.authors[0]}
                        iconType="author"
                        books={data.byAuthor.books}
                        emptyMessage="Keine Empfehlungen für diesen Autor gefunden"
                    />
                )}

                {hasCategories && (
                    <DiscoverySection
                        title="Entdecke dein Lieblingsgenre"
                        subtitle={data.byCategory.categories[0]}
                        iconType="category"
                        books={data.byCategory.books}
                        emptyMessage="Keine Empfehlungen für dieses Genre gefunden"
                    />
                )}

                {hasSearches && (
                    <DiscoverySection
                        title="Basierend auf deinen Suchen"
                        subtitle={data.bySearch.queries[0]}
                        iconType="search"
                        books={data.bySearch.books}
                        emptyMessage="Keine ähnlichen Bücher gefunden"
                    />
                )}

                {!hasAnyData && (
                    <div className={styles.emptyState}>
                        <FaBookOpen className={styles.emptyIcon} />
                        <p>Füge zuerst einige Bücher zu deiner Bibliothek hinzu, um personalisierte Empfehlungen zu erhalten.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscoveryPage;

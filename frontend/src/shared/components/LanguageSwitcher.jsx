
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-switcher">
            <button
                className={i18n.resolvedLanguage === 'en' ? 'active' : ''}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
            <span className="separator">|</span>
            <button
                className={i18n.resolvedLanguage === 'de' ? 'active' : ''}
                onClick={() => changeLanguage('de')}
            >
                DE
            </button>
        </div>
    );
};

export default LanguageSwitcher;

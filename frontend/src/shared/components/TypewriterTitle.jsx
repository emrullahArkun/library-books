import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const TypewriterTitle = () => {
    const { t } = useTranslation();
    const fullText = t('search.welcomeMessage');
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Reset state when text changes
        setDisplayedText('');
        setCurrentIndex(0);

        let i = 0;
        const intervalId = setInterval(() => {
            i += 1;
            setDisplayedText(fullText.slice(0, i));
            setCurrentIndex(i);

            if (i >= fullText.length) {
                clearInterval(intervalId);
            }
        }, 50); // Typing speed

        return () => clearInterval(intervalId);
    }, [fullText]);

    return (
        <h1 style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "1.5em" }}>
            {displayedText}
            {currentIndex < fullText.length && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ display: 'inline-block', marginLeft: '2px', width: '2px', height: '1em', backgroundColor: 'currentColor' }}
                />
            )}
        </h1>
    );
};

export default TypewriterTitle;

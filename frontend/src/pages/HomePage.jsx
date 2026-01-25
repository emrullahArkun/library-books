import { useEffect } from 'react';
import TypewriterTitle from '../shared/components/TypewriterTitle';
import BookSearch from '../features/book-search/BookSearch';
import styles from './HomePage.module.css';
import { Flex, Box } from '@chakra-ui/react';
import GoalDashboard from '../features/my-books/components/GoalDashboard';

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
            <Box w="full" position="relative">
                <Flex justify="space-between" align="center" w="100%" pr={{ base: 4, md: 8 }}>
                    <Box flex="1">
                        <TypewriterTitle />
                    </Box>
                    <Box mr={8}>
                        <GoalDashboard />
                    </Box>
                </Flex>
            </Box>
            <BookSearch />
        </div>
    );
};

export default HomePage;

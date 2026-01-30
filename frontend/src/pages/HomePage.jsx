import { usePinstripeBackground } from '../hooks/usePinstripeBackground';
import TypewriterTitle from '../shared/components/TypewriterTitle';
import BookSearch from '../features/book-search/BookSearch';
import styles from './HomePage.module.css';
import { Flex, Box } from '@chakra-ui/react';
import GoalDashboard from '../features/my-books/components/GoalDashboard';

const HomePage = () => {
    usePinstripeBackground();

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

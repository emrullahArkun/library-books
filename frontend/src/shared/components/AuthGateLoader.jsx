import { Center, Spinner } from '@chakra-ui/react';

const AuthGateLoader = () => (
    <Center minH="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" />
    </Center>
);

export default AuthGateLoader;

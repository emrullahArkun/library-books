import { Component } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="transparent">
                    <VStack spacing={4} textAlign="center" p={8}>
                        <Heading size="lg" color="white">Something went wrong</Heading>
                        <Text color="gray.300">{this.state.error?.message}</Text>
                        <Button colorScheme="teal" onClick={this.handleReset}>
                            Try Again
                        </Button>
                    </VStack>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

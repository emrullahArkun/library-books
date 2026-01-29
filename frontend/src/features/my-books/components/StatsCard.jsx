import {
    Card,
    CardBody,
    Flex,
    Icon,
    Text,
    Stat,
    StatNumber,
    StatHelpText
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const StatsCard = ({ icon, label, value, subLabel, color, delay, bg, textColor }) => {
    return (
        <MotionCard
            bg={bg}
            borderRadius="2xl"
            boxShadow="lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            overflow="hidden"
            backdropFilter="blur(10px)"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl', bg: 'whiteAlpha.300' }}
        >
            <CardBody p={6}>
                <Flex align="center" mb={4}>
                    <Flex
                        justify="center"
                        align="center"
                        w={10}
                        h={10}
                        borderRadius="xl"
                        bg={`${color.split('.')[0]}.900`}
                        color={color}
                        mr={4}
                    >
                        <Icon as={icon} boxSize={5} />
                    </Flex>
                    <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                        {label}
                    </Text>
                </Flex>
                <Stat>
                    <StatNumber fontSize="4xl" fontWeight="800" color={textColor}>
                        {value}
                    </StatNumber>
                    <StatHelpText m={0} fontSize="sm" color="gray.400" fontWeight="medium">
                        {subLabel}
                    </StatHelpText>
                </Stat>
            </CardBody>
        </MotionCard>
    );
};

export default StatsCard;

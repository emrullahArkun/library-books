import {
    Box,
    Card,
    Flex,
    Heading,
    Text,
    Icon,
    Button
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { FaChartLine } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReadingCalendar from './ReadingCalendar';

const MotionCard = motion(Card);

const BookStatsCharts = ({
    stats,
    sessions,
    bookId,
    cardBg,
    textColor,
    subTextColor
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            p={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            backdropFilter="blur(10px)"
        >
            <Flex justify="space-between" align="center" mb={10}>
                <Box>
                    <Heading size="md" fontWeight="bold" color={textColor} mb={1}>
                        {t('bookStats.chart.title')}
                    </Heading>
                    <Text fontSize="sm" color={subTextColor}>{t('bookStats.chart.subTitle')}</Text>
                </Box>
                <Flex align="center">
                    <ReadingCalendar sessions={sessions} />
                </Flex>
            </Flex>

            <Box h="400px" w="full">
                {stats.graphData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#319795" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#319795" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#A0AEC0', fontSize: 12, fontWeight: 500 }}
                                dy={15}
                            />
                            <YAxis
                                hide
                                domain={[0, stats.totalPages || 'auto']}
                            />
                            <Tooltip
                                cursor={{ stroke: '#319795', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    backgroundColor: '#1A202C',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    padding: '12px 16px',
                                    color: '#FFF'
                                }}
                                itemStyle={{ color: '#81E6D9', fontWeight: 'bold' }} // teal.200
                                labelStyle={{ color: '#A0AEC0', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="page"
                                stroke="#81E6D9"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPage)"
                                activeDot={{ r: 6, strokeWidth: 4, stroke: '#1A202C' }} // Donut dot effect
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Flex h="100%" justify="center" align="center" direction="column" color={subTextColor} bg="whiteAlpha.100" borderRadius="xl">
                        <Icon as={FaChartLine} w={12} h={12} mb={4} opacity={0.3} />
                        <Text fontSize="lg" fontWeight="medium">{t('bookStats.chart.noData')}</Text>
                        <Button mt={4} colorScheme="teal" variant="ghost" size="sm" onClick={() => navigate(`/books/${bookId}/session`)}>
                            {t('bookStats.chart.readNow')}
                        </Button>
                    </Flex>
                )}
            </Box>
        </MotionCard>
    );
};

export default BookStatsCharts;

/**
 * Centralized theme tokens used across pages with the pinstripe background.
 * Avoids repeating the same useColorModeValue / constant definitions in every page.
 */
export const useThemeTokens = () => ({
    bgColor: 'transparent',
    cardBg: 'whiteAlpha.200',
    textColor: 'white',
    subTextColor: 'gray.300',
    brandColor: 'teal.200',
});

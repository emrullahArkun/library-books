import { useReadingSessionContext } from '../../../context/ReadingSessionContext';

export const useReadingSession = () => {
    return useReadingSessionContext();
};

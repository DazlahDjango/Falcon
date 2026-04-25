import { useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useScoreUpdates = (userId) => {
    const [latestScore, setLatestScore] = useState(null);
    const endpoint = `/ws/kpi/scores/${userId}/`;
    const handleScoreUpdate = useCallback((data) => {
        if (data.type === 'score_update') {
            setLatestScore(data.data);
        }
    }, []);
    const { isConnected, sendMessage } = useWebSocket(endpoint, handleScoreUpdate, {
        autoConnect: !!userId
    });
    const refreshScores = useCallback(() => {
        sendMessage({ type: 'refresh' });
    }, [sendMessage]);
    return {
        latestScore,
        isConnected,
        refreshScores
    };
};
export default useScoreUpdates;
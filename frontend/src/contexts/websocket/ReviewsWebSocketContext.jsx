import React, { createContext, useContext } from 'react';
import { useReviewsWebSocket } from '../../hooks/reviews/useReviewsWebSocket';

const ReviewsWebSocketContext = createContext(null);

export const useReviewsWebSocketContext = () => useContext(ReviewsWebSocketContext);

export const ReviewsWebSocketProvider = ({ children, cycleId, sessionId, channel = 'notifications' }) => {
    const { isConnected, lastMessage, send } = useReviewsWebSocket({ cycleId, sessionId, channel });

    return (
        <ReviewsWebSocketContext.Provider value={{
            isConnected,
            lastMessage,
            send
        }}>
            {children}
        </ReviewsWebSocketContext.Provider>
    );
};

export default ReviewsWebSocketProvider;

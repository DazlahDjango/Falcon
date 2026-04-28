import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useWebSocket } from '../../../hooks/kpi/useWebSocket';

const KPIDashboardConsumer = ({ userId, onScoreUpdate, onValidationUpdate, children }) => {
    const { isConnected, lastMessage, sendMessage } = useWebSocket(
        `/ws/kpi/dashboard/${userId}/`,
        (data) => {
            if (data.type === 'score_update' && onScoreUpdate) {
                onScoreUpdate(data.data);
            }
            if (data.type === 'validation_update' && onValidationUpdate) {
                onValidationUpdate(data.data);
            }
        },
        { autoConnect: !!userId }
    );
    return children({ isConnected, sendMessage, lastMessage });
};
KPIDashboardConsumer.propTypes = {
    userId: PropTypes.string.isRequired,
    onScoreUpdate: PropTypes.func,
    onValidationUpdate: PropTypes.func,
    children: PropTypes.func.isRequired,
};
export default KPIDashboardConsumer;
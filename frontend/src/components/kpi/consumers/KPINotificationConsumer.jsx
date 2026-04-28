import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useKPINotifications } from '../../../hooks/kpi/useWebSocket';

const KPINotificationConsumer = ({ userId, onNotification, children }) => {
    const { isConnected, sendNotification } = useKPINotifications(userId);
    useEffect(() => {
        if (onNotification) {
            const handleNotification = (data) => {
                onNotification(data);
            };
        }
    }, [onNotification]);
    return children({ isConnected, sendNotification });
};
KPINotificationConsumer.propTypes = {
    userId: PropTypes.string.isRequired,
    onNotification: PropTypes.func,
    children: PropTypes.func.isRequired,
};
export default KPINotificationConsumer;
import { FiActivity, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { clearKpiBanner } from '../../../store/kpi/slice/kpiRealtimeSlice';
import '../../../styles/kpi/realtime-banner.css';

export const GlobalKpiBanner = () => {
    const dispatch = useDispatch();
    const banner = useSelector((state) => state.kpiRealtime?.banner);
    const wsConnected = useSelector((state) => state.kpiRealtime?.wsConnected);

    if (!banner) return null;

    const typeClass = banner.type === 'error'
        ? 'kpi-realtime-banner--error'
        : banner.type === 'warning'
            ? 'kpi-realtime-banner--warning'
            : 'kpi-realtime-banner--info';

    const liveOn = wsConnected?.dashboard || wsConnected?.validation;

    return (
        <div className={`kpi-realtime-banner ${typeClass}`} role="alert">
            <div className="kpi-realtime-banner__body">
                <FiActivity className="kpi-realtime-banner__icon" />
                <div>
                    <div className="kpi-realtime-banner__title">{banner.title}</div>
                    {banner.message && (
                        <div className="kpi-realtime-banner__message">{banner.message}</div>
                    )}
                    {banner.link && (
                        <Link to={banner.link} className="kpi-realtime-banner__link">
                            Open validation queue
                        </Link>
                    )}
                </div>
            </div>
            <div className="kpi-realtime-banner__actions">
                <span
                    className={`kpi-realtime-banner__live ${liveOn ? 'kpi-realtime-banner__live--on' : ''}`}
                    title={liveOn ? 'KPI channel live' : 'KPI channel offline'}
                >
                    {liveOn ? 'Live' : 'Offline'}
                </span>
                {banner.dismissible !== false && (
                    <button
                        type="button"
                        className="kpi-realtime-banner__close"
                        onClick={() => dispatch(clearKpiBanner())}
                        aria-label="Dismiss"
                    >
                        <FiX />
                    </button>
                )}
            </div>
        </div>
    );
};

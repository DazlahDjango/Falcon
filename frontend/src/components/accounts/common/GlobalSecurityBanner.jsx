import { FiShield, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { clearSecurityBanner } from '../../../store/accounts/slice/securitySlice';
import {
    selectSecurityBanner,
    selectSecurityWsConnected,
} from '../../../store/accounts/selectors/securitySelectors';

export const GlobalSecurityBanner = () => {
    const dispatch = useDispatch();
    const banner = useSelector(selectSecurityBanner);
    const wsConnected = useSelector(selectSecurityWsConnected);

    if (!banner) return null;

    const typeClass = banner.type === 'error'
        ? 'accounts-security-banner--error'
        : banner.type === 'warning'
            ? 'accounts-security-banner--warning'
            : 'accounts-security-banner--info';

    return (
        <div className={`accounts-security-banner ${typeClass}`} role="alert">
            <div className="accounts-security-banner__body">
                <FiShield className="accounts-security-banner__icon" />
                <div>
                    <div className="accounts-security-banner__title">{banner.title}</div>
                    {banner.message && (
                        <div className="accounts-security-banner__message">{banner.message}</div>
                    )}
                </div>
            </div>
            <div className="accounts-security-banner__actions">
                <span
                    className={`accounts-security-banner__live ${wsConnected ? 'accounts-security-banner__live--on' : ''}`}
                    title={wsConnected ? 'Security channel live' : 'Security channel offline'}
                >
                    {wsConnected ? 'Live' : 'Offline'}
                </span>
                {(banner.dismissible !== false) && (
                    <button
                        type="button"
                        className="accounts-security-banner__close"
                        onClick={() => dispatch(clearSecurityBanner())}
                        aria-label="Dismiss"
                    >
                        <FiX />
                    </button>
                )}
            </div>
        </div>
    );
};

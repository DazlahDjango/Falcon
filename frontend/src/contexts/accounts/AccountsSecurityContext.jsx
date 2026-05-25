import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authWsClient } from '../../services/accounts/websocket/client';
import { getActiveSessions } from '../../services/accounts/api/sessions';
import { handleSecurityEvent } from '../../services/accounts/websocket/handlers';
import {
    setSecurityWsConnected,
    setSecurityBanner,
    setSecurityEvent,
    setForcedLogoutReason,
} from '../../store/accounts/slice/securitySlice';
import { clearTokens } from '../../services/accounts/storage/secureStorage';
import { ROUTES } from '../../config/constants';

const AccountsSecurityContext = createContext(null);

export const useAccountsSecurityContext = () => {
    const ctx = useContext(AccountsSecurityContext);
    return ctx;
};

export const AccountsSecurityProvider = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth || {});
    const handlerRef = useRef(null);

    const processSecurityEvent = useCallback((payload) => {
        const { event, data } = payload;
        dispatch(setSecurityEvent({ event, data, at: Date.now() }));

        if (event === 'user_deactivated' && data?.force_logout === false) {
            dispatch(setSecurityBanner({
                type: 'warning',
                title: 'User deactivated',
                message: `${data?.email || 'A user'} was deactivated (${data?.sessions_terminated ?? 0} sessions ended).`,
                dismissible: true,
            }));
        }

        if (event === 'session_revoked') {
            const currentSessionId = sessionStorage.getItem('current_session_id');
            if (!data.session_id || data.session_id === currentSessionId) {
                dispatch(setForcedLogoutReason('Your session was revoked by an administrator.'));
                dispatch(setSecurityBanner({
                    type: 'warning',
                    title: 'Session ended',
                    message: 'Your session was revoked. Please sign in again.',
                }));
                clearTokens().then(() => {
                    window.dispatchEvent(new Event('auth:logout'));
                    navigate(ROUTES.LOGIN);
                });
            }
        }

        if (event === 'user_deactivated' && data?.force_logout === true) {
            dispatch(setForcedLogoutReason('Your account has been deactivated.'));
            dispatch(setSecurityBanner({
                type: 'error',
                title: 'Account deactivated',
                message: 'Your access has been revoked. Contact your administrator.',
            }));
            clearTokens().then(() => {
                window.dispatchEvent(new Event('auth:logout'));
                navigate(ROUTES.LOGIN);
            });
        }

        if (event === 'account_locked') {
            dispatch(setSecurityBanner({
                type: 'warning',
                title: 'Account locked',
                message: data?.locked_until
                    ? `Too many failed attempts. Try again after ${data.locked_until}.`
                    : 'Too many failed login attempts. Please wait before retrying.',
            }));
        }

        if (event === 'mfa_required') {
            dispatch(setSecurityBanner({
                type: 'info',
                title: 'MFA required',
                message: 'Your organization requires multi-factor authentication for your role.',
            }));
        }

        if (event === 'policy_updated') {
            dispatch(setSecurityBanner({
                type: 'info',
                title: 'Security policy updated',
                message: `Policy ${data?.scope || 'tenant'} updated (v${data?.version ?? '?'}). Refresh settings if needed.`,
                dismissible: true,
            }));
        }

        handleSecurityEvent({ event, data });
    }, [dispatch, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            authWsClient.disconnect();
            dispatch(setSecurityWsConnected(false));
            return undefined;
        }

        const onSecurity = (payload) => processSecurityEvent(payload);

        const bootstrapSession = async () => {
            try {
                const res = await getActiveSessions();
                const current = (res.data?.sessions || []).find((s) => s.is_current);
                if (current?.id) {
                    sessionStorage.setItem('current_session_id', current.id);
                }
            } catch {
                /* non-fatal */
            }
        };

        bootstrapSession();
        authWsClient.connect('auth')
            .then(() => {
                dispatch(setSecurityWsConnected(true));
                authWsClient.on('security_event', onSecurity);
            })
            .catch(() => {
                dispatch(setSecurityWsConnected(false));
            });

        return () => {
            authWsClient.off('security_event', onSecurity);
        };
    }, [isAuthenticated, dispatch, processSecurityEvent]);

    const value = {
        processSecurityEvent,
    };

    return (
        <AccountsSecurityContext.Provider value={value}>
            {children}
        </AccountsSecurityContext.Provider>
    );
};

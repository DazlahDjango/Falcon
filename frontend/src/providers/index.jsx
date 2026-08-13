// frontend/src/providers/index.jsx
import React from 'react';
import { AuthProvider } from '../contexts/accounts/AuthContext';
import { AccountsSecurityProvider } from '../contexts/accounts/AccountsSecurityContext';
import { TenantProvider } from '../contexts/tenant/TenantContext';
import { PermissionProvider } from '../contexts/accounts/PermissionContext';
import { BillingProviders } from '../contexts/billing';
import { ConfigProvider, BackupProvider, MaintenanceProvider, DRProvider, ConfigAlertProvider } from '../contexts/config';
import { WebSocketProvider } from '../contexts/websocket';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';
import QueryProvider from './QueryProvider';
import StoreProvider from './StoreProvider';
import ErrorBoundary from './ErrorBoundary';

const Providers = ({ children }) => {
    return (
        <ErrorBoundary>
            <StoreProvider>
                <QueryProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            <AuthProvider>
                                <PermissionProvider>
                                    <AccountsSecurityProvider>
                                        <WebSocketProvider>
                                            <TenantProvider>
                                                <ConfigProvider>
                                                    <BackupProvider>
                                                        <MaintenanceProvider>
                                                            <DRProvider>
                                                                <ConfigAlertProvider>
                                                                    <BillingProviders>
                                                                        {children}
                                                                    </BillingProviders>
                                                                </ConfigAlertProvider>
                                                            </DRProvider>
                                                        </MaintenanceProvider>
                                                    </BackupProvider>
                                                </ConfigProvider>
                                            </TenantProvider>
                                        </WebSocketProvider>
                                    </AccountsSecurityProvider>
                                </PermissionProvider>
                            </AuthProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </QueryProvider>
            </StoreProvider>
        </ErrorBoundary>
    );
};

export default Providers;
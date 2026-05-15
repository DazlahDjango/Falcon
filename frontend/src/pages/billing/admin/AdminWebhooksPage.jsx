import React from 'react';
import { WebhookLogsViewer } from '../../../components/billing/admin/WebhookLogsViewer';
import { BillingLayout } from '../../../components/billing/shared/BillingLayout';

export const AdminWebhooksPage = () => {
    return (
        <BillingLayout 
            title="Webhook Monitor"
            subtitle="Monitor incoming webhook events"
        >
            <WebhookLogsViewer />
        </BillingLayout>
    );
};

export default AdminWebhooksPage;
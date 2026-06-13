import React from 'react';

const KPIStatusBadge = ({ status, showDot = true, customText = null }) => {
    const getStatusConfig = () => {
        const statusMap = {
            // KPI Statuses
            active: { color: 'green', text: 'Active' },
            inactive: { color: 'gray', text: 'Inactive' },
            draft: { color: 'gray', text: 'Draft' },
            published: { color: 'green', text: 'Published' },
            archived: { color: 'gray', text: 'Archived' },
            
            // Actual Statuses
            pending: { color: 'yellow', text: 'Pending' },
            approved: { color: 'green', text: 'Approved' },
            rejected: { color: 'red', text: 'Rejected' },
            adjusted: { color: 'blue', text: 'Adjusted' },
            
            // Traffic Light Statuses
            green: { color: 'green', text: 'On Track' },
            yellow: { color: 'yellow', text: 'At Risk' },
            red: { color: 'red', text: 'Off Track' },
            
            // Framework Statuses
            published_framework: { color: 'green', text: 'Published' },
            draft_framework: { color: 'gray', text: 'Draft' },
            archived_framework: { color: 'gray', text: 'Archived' },
            
            // Escalation Statuses
            reviewing: { color: 'blue', text: 'Under Review' },
            resolved: { color: 'green', text: 'Resolved' },
            closed: { color: 'gray', text: 'Closed' }
        };
        
        return statusMap[status?.toLowerCase()] || { color: 'gray', text: status || 'Unknown' };
    };

    const config = getStatusConfig();
    const displayText = customText || config.text;

    return (
        <span className={`kpi-status-badge kpi-status-badge-${config.color}`}>
            {showDot && <span className={`kpi-status-badge-dot kpi-status-badge-dot-${config.color}`} />}
            {displayText}
        </span>
    );
};

export default KPIStatusBadge;
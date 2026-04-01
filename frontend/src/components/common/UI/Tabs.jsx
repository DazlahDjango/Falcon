import React, { useState } from 'react';

const Tabs = ({
    tabs,
    activeTab = null,
    onChange,
    variant = 'default',
    className = '',
    children
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState(activeTab || (tabs[0]?.key));
    const currentTab = activeTab !== undefined ? activeTab : internalActiveTab;
    const handleTabChange = (tabKey) => {
        if (activeTab === undefined) {
            setInternalActiveTab(tabKey);
        }
        if (onChange) {
            onChange(tabKey);
        }
    };
    const variantClasses = {
        default: 'tabs-default',
        underline: 'tabs-underline',
        pills: 'tabs-pills',
        bordered: 'tabs-bordered'
    };
    const tabsClasses = [
        'tabs',
        variantClasses[variant],
        className
    ].filter(Boolean).join(' ');
    const activeTabContent = tabs.find(tab => tab.key === currentTab)?.content;
    return (
        <div className="tabs-container">
            <div className={tabsClasses}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab ${currentTab === tab.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                        disabled={tab.disabled}
                    >
                        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                        <span className="tab-label">{tab.label}</span>
                        {tab.badge && (
                            <span className="tab-badge">{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {children || activeTabContent}
            </div>
        </div>
    );
};

export { Tabs };
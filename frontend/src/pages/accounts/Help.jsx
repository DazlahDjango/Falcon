import React from 'react';
import { FiMail, FiBook, FiMessageSquare, FiHelpCircle } from 'react-icons/fi';

const Help = () => {
    const supportItems = [
        {
            icon: <FiBook size={24} />,
            title: 'Documentation',
            description: 'Read our comprehensive documentation',
            action: 'View Docs',
            link: '/docs'
        },
        {
            icon: <FiMessageSquare size={24} />,
            title: 'Contact Support',
            description: 'Get help from our support team',
            action: 'Contact Us',
            link: '/support'
        },
        {
            icon: <FiHelpCircle size={24} />,
            title: 'FAQ',
            description: 'Frequently asked questions',
            action: 'Read FAQ',
            link: '/faq'
        },
        {
            icon: <FiMail size={24} />,
            title: 'Email Us',
            description: 'support@falconpms.com',
            action: 'Send Email',
            link: 'mailto:support@falconpms.com'
        }
    ];

    return (
        <div className="help-page">
            <div className="page-header">
                <h1>Help & Support</h1>
                <p>Find answers to your questions and get support</p>
            </div>

            <div className="help-grid">
                {supportItems.map((item, index) => (
                    <div key={index} className="help-card">
                        <div className="help-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <a href={item.link} className="help-link">
                            {item.action} →
                        </a>
                    </div>
                ))}
            </div>

            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    <div className="faq-item">
                        <h4>How do I reset my password?</h4>
                        <p>Click "Forgot Password" on the login page and follow the instructions sent to your email.</p>
                    </div>
                    <div className="faq-item">
                        <h4>How do I enable Two-Factor Authentication?</h4>
                        <p>Go to Settings → Security and click "Enable MFA". Follow the setup instructions.</p>
                    </div>
                    <div className="faq-item">
                        <h4>How are KPIs calculated?</h4>
                        <p>KPIs are calculated based on actual vs target values with configurable formulas.</p>
                    </div>
                    <div className="faq-item">
                        <h4>What are the different user roles?</h4>
                        <p>Roles include Staff, Supervisor, Executive, Admin, and Super Admin with varying permissions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
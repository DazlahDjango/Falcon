import React from 'react';

const About = () => {
    return (
        <div className="about-page">
            <div className="page-header">
                <h1>About Falcon PMS</h1>
                <p>Performance Management System for Modern Organizations</p>
            </div>

            <div className="about-content">
                <div className="about-section">
                    <h2>Our Mission</h2>
                    <p>
                        To empower organizations with a comprehensive performance management
                        solution that streamlines goal tracking, enhances accountability,
                        and drives continuous improvement.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Key Features</h2>
                    <ul>
                        <li>✓ Smart KPI Tracking with Automated Calculations</li>
                        <li>✓ Real-time Performance Dashboards</li>
                        <li>✓ Hierarchical Team Management</li>
                        <li>✓ Performance Reviews & Appraisals</li>
                        <li>✓ Mission Status Reports</li>
                        <li>✓ Multi-factor Authentication</li>
                        <li>✓ Comprehensive Audit Logs</li>
                        <li>✓ Role-based Access Control</li>
                    </ul>
                </div>

                <div className="about-section">
                    <h2>Technology Stack</h2>
                    <div className="tech-stack">
                        <div className="tech-item">React 18</div>
                        <div className="tech-item">Redux Toolkit</div>
                        <div className="tech-item">Django REST Framework</div>
                        <div className="tech-item">PostgreSQL</div>
                        <div className="tech-item">Redis</div>
                        <div className="tech-item">WebSockets</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
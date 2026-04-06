/**
 * Home - Landing page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/accounts/useAuth';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-page">
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Falcon PMS</h1>
                    <p className="hero-subtitle">Performance Management System</p>
                    <p className="hero-description">
                        Streamline your organization's performance tracking, KPI management,
                        and employee reviews in one unified platform.
                    </p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary btn-lg">
                                    Get Started
                                </Link>
                                <Link to="/register" className="btn btn-secondary btn-lg">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-image">
                    <div className="dashboard-preview">
                        <div className="preview-card">
                            <div className="preview-header">
                                <div className="preview-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className="preview-title">Performance Dashboard</div>
                            </div>
                            <div className="preview-stats">
                                <div className="stat">
                                    <div className="stat-value">94%</div>
                                    <div className="stat-label">Overall Performance</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-value">12</div>
                                    <div className="stat-label">Active KPIs</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-value">8</div>
                                    <div className="stat-label">Team Members</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h2>Why Choose Falcon PMS?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Smart KPI Tracking</h3>
                        <p>Track key performance indicators with automated calculations and real-time updates.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Team Management</h3>
                        <p>View team hierarchies, manage reports, and monitor team performance.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Enterprise Security</h3>
                        <p>MFA, role-based access, and audit logging to protect your data.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>Real-time Analytics</h3>
                        <p>Interactive dashboards and reports for data-driven decisions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
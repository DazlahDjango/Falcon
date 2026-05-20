import React from "react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-copyright">
                    © {currentYear} Falcon Consulting. All rights reserved.
                </div>
                <div className="footer-links">
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    <span className="footer-divider">|</span>
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                    <span className="footer-divider">|</span>
                    <a href="/support" target="_blank" rel="noopener noreferrer">Support</a>
                    <span className="footer-divider">|</span>
                    <a href="/dashboard" rel="noopener noreferrer">Dashboard</a>
                </div>
                <div className="footer-version">
                    Version 2.0.0
                </div>
            </div>
        </footer>
    );
};

export default Footer;
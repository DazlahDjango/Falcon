import React from "react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="ent-app-footer">
            <div className="ent-footer-content">
                <div className="ent-footer-copyright">
                    © {currentYear} Falcon PMS. All rights reserved.
                </div>
                <div className="ent-footer-links">
                    <span>Version 1.0.0</span>
                    <span className="ent-footer-divider">|</span>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    <span className="ent-footer-divider">|</span>
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                    <span className="ent-footer-divider">|</span>
                    <a href="/support" target="_blank" rel="noopener noreferrer">Support</a>
                    <span className="ent-footer-divider">|</span>
                    <span className="ent-footer-status">
                        <span className="ent-footer-status-dot"></span>
                        All Systems Operational
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;